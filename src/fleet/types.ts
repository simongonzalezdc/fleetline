/**
 * Fleetline core types: missions, tasks, workers, and fleet events.
 *
 * A mission is a goal ("give me a briefing on these sources") decomposed into
 * a task graph executed by a pool of role-specialized workers. Every state
 * change emits a FleetEvent, which the MCP server forwards to clients as
 * MCP logging notifications (live progress over Streamable HTTP).
 */

export type MissionKind = "briefing" | "audit";

export type MissionStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type WorkerRole = "fetcher" | "analyst" | "composer";

export type WorkerStatus = "idle" | "busy" | "done" | "failed";

export interface SourceRef {
  /** A http(s) URL or a bundled corpus reference like "corpus:ai-news" */
  ref: string;
  label: string;
}

export interface FleetWorker {
  id: string;
  role: WorkerRole;
  status: WorkerStatus;
  tasksDone: number;
  currentTask?: string;
}

export interface TaskRecord {
  id: string;
  missionId: string;
  workerId: string;
  role: WorkerRole;
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: number;
  endedAt?: number;
  error?: string;
}

export interface FetchResult {
  source: SourceRef;
  ok: boolean;
  status?: number;
  latencyMs: number;
  chars: number;
  title: string;
  text: string;
  error?: string;
}

export interface DocAnalysis {
  source: SourceRef;
  title: string;
  wordCount: number;
  readingTimeMin: number;
  keywords: string[];
  topSentences: string[];
}

export interface Mission {
  id: string;
  goal: string;
  kind: MissionKind;
  sources: SourceRef[];
  status: MissionStatus;
  createdAt: number;
  endedAt?: number;
  tasks: TaskRecord[];
  fetches: FetchResult[];
  analyses: DocAnalysis[];
  report?: string;
  error?: string;
}

export type FleetEvent =
  | { type: "mission_created"; missionId: string; goal: string; kind: MissionKind; sourceCount: number; ts: number }
  | { type: "mission_started"; missionId: string; ts: number }
  | { type: "task_started"; missionId: string; taskId: string; workerId: string; role: WorkerRole; label: string; ts: number }
  | { type: "task_completed"; missionId: string; taskId: string; workerId: string; role: WorkerRole; label: string; durationMs: number; ts: number }
  | { type: "task_failed"; missionId: string; taskId: string; workerId: string; role: WorkerRole; label: string; error: string; ts: number }
  | { type: "mission_completed"; missionId: string; goal: string; durationMs: number; ts: number }
  | { type: "mission_failed"; missionId: string; error: string; ts: number }
  | { type: "mission_cancelled"; missionId: string; ts: number };

export interface MissionSummary {
  id: string;
  goal: string;
  kind: MissionKind;
  status: MissionStatus;
  progress: string;
  createdAt: number;
  durationMs?: number;
  taskStats: { total: number; completed: number; failed: number };
}
