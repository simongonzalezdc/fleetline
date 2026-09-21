/**
 * FleetManager: the orchestration core. Owns the worker pool and the mission
 * lifecycle (fetch in parallel, analyze in parallel, compose once), and emits
 * a FleetEvent for every state transition. The MCP server bridges these
 * events to clients as MCP logging notifications over Streamable HTTP.
 */

import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import type {
  DocAnalysis,
  FetchResult,
  FleetEvent,
  FleetWorker,
  Mission,
  MissionKind,
  MissionSummary,
  SourceRef,
  TaskRecord,
  WorkerRole,
} from "./types.js";
import { fetchSource } from "./workers/fetch.js";
import { analyzeDocument } from "./workers/analyze.js";
import { composeReport } from "./workers/compose.js";

export interface SubmitMissionInput {
  goal: string;
  sources: SourceRef[];
  kind: MissionKind;
}

const WORKERS_PER_ROLE: Record<WorkerRole, number> = {
  fetcher: 4,
  analyst: 3,
  composer: 1,
};

function labelForSource(s: SourceRef): string {
  return s.label;
}

export class FleetManager {
  readonly missions = new Map<string, Mission>();
  readonly workers: FleetWorker[] = [];
  private readonly events = new EventEmitter();
  private seq = 0;

  constructor() {
    for (const [role, count] of Object.entries(WORKERS_PER_ROLE) as [WorkerRole, number][]) {
      for (let i = 1; i <= count; i++) {
        this.workers.push({
          id: `${role}-${String(i).padStart(2, "0")}`,
          role,
          status: "idle",
          tasksDone: 0,
        });
      }
    }
  }

  onEvent(listener: (e: FleetEvent) => void): () => void {
    this.events.on("event", listener);
    return () => this.events.off("event", listener);
  }

  private emit(e: FleetEvent): void {
    this.events.emit("event", e);
  }

  private nextId(prefix: string): string {
    this.seq += 1;
    return `${prefix}-${String(this.seq).padStart(3, "0")}`;
  }

  private claimWorker(role: WorkerRole, taskLabel: string): FleetWorker {
    const free = this.workers.find((w) => w.role === role && w.status === "idle")
      ?? this.workers.find((w) => w.role === role);
    const w = free as FleetWorker;
    w.status = "busy";
    w.currentTask = taskLabel;
    return w;
  }

  private releaseWorker(w: FleetWorker, ok: boolean): void {
    w.status = ok ? "done" : "failed";
    w.tasksDone += 1;
    w.currentTask = undefined;
    // Workers return to idle after a micro-task so rapid missions reuse them.
    setTimeout(() => {
      if (w.status !== "busy") w.status = "idle";
    }, 250).unref?.();
  }

  roster(): FleetWorker[] {
    return this.workers.map((w) => ({ ...w }));
  }

  listMissions(): MissionSummary[] {
    return [...this.missions.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
      .map(summarize);
  }

  getMission(id: string): Mission | undefined {
    return this.missions.get(id);
  }

  status(missionId?: string): MissionSummary | MissionSummary[] | undefined {
    if (missionId === undefined) return this.listMissions();
    const m = this.missions.get(missionId);
    return m ? summarize(m) : undefined;
  }

  cancel(missionId: string): boolean {
    const m = this.missions.get(missionId);
    if (!m) return false;
    if (m.status === "running" || m.status === "queued") {
      m.status = "cancelled";
      m.endedAt = Date.now();
      this.emit({ type: "mission_cancelled", missionId, ts: Date.now() });
    }
    return true;
  }

  async waitFor(missionId: string, timeoutMs: number): Promise<Mission | undefined> {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const m = this.missions.get(missionId);
      if (!m) return undefined;
      if (m.status !== "queued" && m.status !== "running") return m;
      if (Date.now() >= deadline) return m;
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  async submit(input: SubmitMissionInput): Promise<Mission> {
    const mission: Mission = {
      id: this.nextId("m"),
      goal: input.goal,
      kind: input.kind,
      sources: input.sources,
      status: "queued",
      createdAt: Date.now(),
      tasks: [],
      fetches: [],
      analyses: [],
    };
    this.missions.set(mission.id, mission);
    this.emit({
      type: "mission_created",
      missionId: mission.id,
      goal: mission.goal,
      kind: mission.kind,
      sourceCount: mission.sources.length,
      ts: Date.now(),
    });
    // Fire-and-forget so the tool call returns the mission id immediately.
    void this.run(mission).catch((err) => {
      mission.status = "failed";
      mission.error = (err as Error).message;
      this.emit({ type: "mission_failed", missionId: mission.id, error: mission.error!, ts: Date.now() });
    });
    return mission;
  }

  private task(mission: Mission, role: WorkerRole, label: string): TaskRecord {
    const t: TaskRecord = {
      id: this.nextId("t"),
      missionId: mission.id,
      workerId: "",
      role,
      label,
      status: "pending",
    };
    const w = this.claimWorker(role, label);
    t.workerId = w.id;
    mission.tasks.push(t);
    return t;
  }

  private async runTask<T>(mission: Mission, role: WorkerRole, label: string, fn: () => Promise<T>): Promise<T | undefined> {
    const t = this.task(mission, role, label);
    if (mission.status === "cancelled") return undefined;
    const worker = this.workers.find((w) => w.id === t.workerId)!;
    t.status = "running";
    t.startedAt = Date.now();
    this.emit({ type: "task_started", missionId: mission.id, taskId: t.id, workerId: t.workerId, role, label, ts: Date.now() });
    try {
      const result = await fn();
      t.status = "completed";
      t.endedAt = Date.now();
      this.releaseWorker(worker, true);
      this.emit({ type: "task_completed", missionId: mission.id, taskId: t.id, workerId: t.workerId, role, label, durationMs: t.endedAt - t.startedAt!, ts: Date.now() });
      return result;
    } catch (err) {
      t.status = "failed";
      t.endedAt = Date.now();
      t.error = (err as Error).message;
      this.releaseWorker(worker, false);
      this.emit({ type: "task_failed", missionId: mission.id, taskId: t.id, workerId: t.workerId, role, label, error: t.error, ts: Date.now() });
      return undefined;
    }
  }

  private cancelled(mission: Mission): boolean {
    return this.missions.get(mission.id)?.status === "cancelled";
  }

  private async run(mission: Mission): Promise<void> {
    mission.status = "running";
    this.emit({ type: "mission_started", missionId: mission.id, ts: Date.now() });
    const started = Date.now();

    // Stage 1: fetch all sources in parallel (one fetcher per source).
    const fetches = await Promise.all(
      mission.sources.map((s) =>
        this.runTask(mission, "fetcher", `fetch ${labelForSource(s)}`, () => fetchSource(s))
      )
    );
    if (this.cancelled(mission)) return;
    mission.fetches = fetches.filter((f): f is FetchResult => f !== undefined);

    if (mission.kind === "audit") {
      // Audit missions stop after fetching; compose the health report.
      const report = await this.runTask(mission, "composer", "compose audit report", async () =>
        composeReport("audit", mission.goal, mission.fetches, [])
      );
      if (this.cancelled(mission)) return;
      mission.report = report ?? "";
    } else {
      // Stage 2: analyze each fetched document in parallel.
      const good = mission.fetches.filter((f) => f.ok && f.text.length > 200);
      const analyses = await Promise.all(
        good.map((f) =>
          this.runTask(mission, "analyst", `analyze ${f.source.label}`, async () => analyzeDocument(f))
        )
      );
      if (this.cancelled(mission)) return;
      mission.analyses = analyses.filter((a): a is DocAnalysis => a !== undefined);

      // Stage 3: compose one briefing from all analyst outputs.
      const report = await this.runTask(mission, "composer", "compose briefing", async () =>
        composeReport("briefing", mission.goal, mission.fetches, mission.analyses)
      );
      if (this.cancelled(mission)) return;
      mission.report = report ?? "";
    }

    mission.status = mission.report !== undefined && mission.report !== "" ? "completed" : "failed";
    mission.endedAt = Date.now();
    if (mission.status === "completed") {
      this.emit({ type: "mission_completed", missionId: mission.id, goal: mission.goal, durationMs: mission.endedAt - started, ts: Date.now() });
    } else {
      mission.error = "no report produced (all sources failed?)";
      this.emit({ type: "mission_failed", missionId: mission.id, error: mission.error, ts: Date.now() });
    }
  }
}

export function summarize(m: Mission): MissionSummary {
  const total = m.tasks.length;
  const completed = m.tasks.filter((t) => t.status === "completed").length;
  const failed = m.tasks.filter((t) => t.status === "failed").length;
  return {
    id: m.id,
    goal: m.goal,
    kind: m.kind,
    status: m.status,
    progress: total > 0 ? `${completed}/${total} tasks` : "starting",
    createdAt: m.createdAt,
    durationMs: m.endedAt !== undefined ? m.endedAt - m.createdAt : undefined,
    taskStats: { total, completed, failed },
  };
}

export { randomUUID };
