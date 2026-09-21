/**
 * Deterministic intent router for the simulated Alexa+ experience.
 *
 * In production Alexa+ the model decides which MCP tools to call; in this
 * simulator a deterministic router plays that role (honestly labeled as a
 * stand-in). Input: user utterance. Output: a tool call plan plus the reply
 * spoken when the tool returns.
 */

export interface ToolPlan {
  tool:
    | "fleet_roster"
    | "fleet_mission_submit"
    | "fleet_status"
    | "fleet_collect"
    | "fleet_cancel";
  args: Record<string, unknown>;
  /** How to render the tool result conversationally. */
  speak: "roster" | "submitted" | "status" | "report" | "cancelled";
}

export interface RouterDeps {
  /** Most recent mission id known to the conversation, if any. */
  lastMissionId?: string;
  /** Missions the conversation knows about (id -> goal). */
  missions?: Map<string, string>;
}

const URL_RE = /https?:\/\/[^\s"'<>)]+/g;

export function routeIntent(utterance: string, deps: RouterDeps): ToolPlan | { reply: string } {
  const text = utterance.toLowerCase().trim();
  const last = deps.lastMissionId;

  // Cancel intents.
  if (/\b(cancel|stop|abort|kill|call off)\b/.test(text)) {
    const id = extractMissionId(utterance) ?? last;
    if (!id) return { reply: "There is no mission in flight to cancel. Submit one with 'brief me on' plus a topic." };
    return { tool: "fleet_cancel", args: { missionId: id }, speak: "cancelled" };
  }

  // Status intents.
  if (/\b(status|how's it going|how is it going|progress|update|busy|doing)\b/.test(text)) {
    const id = extractMissionId(utterance) ?? last;
    return { tool: "fleet_status", args: id ? { missionId: id } : {}, speak: "status" };
  }

  // Roster intents.
  if (/\b(roster|workers|who's in|who is in|the fleet|team|crew)\b/.test(text) && !/\b(brief|report|mission)\b/.test(text)) {
    return { tool: "fleet_roster", args: {}, speak: "roster" };
  }

  // Collect / read the report.
  if (/\b(report|briefing|read|collect|results?|what did|summary)\b/.test(text)) {
    const id = extractMissionId(utterance) ?? last;
    if (!id) return { reply: "I do not have a mission to report on yet. Try: brief me on the AI news corpus." };
    return { tool: "fleet_collect", args: { missionId: id, wait: true }, speak: "report" };
  }

  // Submit intents: explicit audit wording or any brief/dispatch phrasing.
  const isAudit = /\b(audit|check the health|health check|are (these|my) sources (ok|up|alive))\b/.test(text);
  const wantsMission =
    isAudit ||
    /\b(brief me|briefing|research|dig into|look into|mission|dispatch|send the fleet|assign|find out|analyze)\b/.test(text);

  if (wantsMission) {
    const urls = [...utterance.matchAll(URL_RE)].map((m) => m[0]).slice(0, 8);
    const kind = isAudit ? "audit" : "briefing";
    const goal = buildGoal(utterance, kind);
    const args: Record<string, unknown> = { goal, kind };
    if (urls.length > 0) args.sources = urls;
    else {
      const corpus = matchCorpus(text);
      if (corpus) args.sources = corpus;
    }
    return { tool: "fleet_mission_submit", args, speak: "submitted" };
  }

  return {
    reply:
      "I can command the fleet for you. Try: 'brief me on the AI news corpus', 'audit https://example.com', 'how is the mission going', or 'read me the report'.",
  };
}

function extractMissionId(utterance: string): string | undefined {
  const m = utterance.match(/\bm-(\d{3})\b/);
  return m ? m[0] : undefined;
}

function matchCorpus(text: string): string[] | undefined {
  const keys = ["ai-news", "coffee-science", "city-cycling", "sleep-research"];
  const hits = keys.filter((k) => text.includes(k));
  if (hits.length > 0) return hits.map((k) => `corpus:${k}`);
  if (/\bai\b|agents?|model|llm/.test(text)) return ["corpus:ai-news"];
  if (/coffee|espresso|brew/.test(text)) return ["corpus:coffee-science"];
  if (/cycling|bike|lanes?/.test(text)) return ["corpus:city-cycling"];
  if (/sleep|nap|circadian/.test(text)) return ["corpus:sleep-research"];
  return undefined;
}

function buildGoal(utterance: string, kind: string): string {
  const cleaned = utterance
    .replace(/^(hey |ok |please )?(alexa|fleet|fleetline)[,: ]*/i, "")
    .replace(/[.?!]+$/, "")
    .trim();
  const short = cleaned.length > 80 ? cleaned.slice(0, 77) + "..." : cleaned;
  return kind === "audit" ? `Audit source health: ${short}` : short || "fleet briefing";
}

/** Render a tool result as a speakable, conversational reply. */
export function renderReply(plan: ToolPlan, result: Record<string, unknown>): string {
  switch (plan.speak) {
    case "roster": {
      const workers = (result.workers ?? []) as Array<{ id: string; role: string; status: string; tasksDone: number }>;
      const byRole = new Map<string, number>();
      for (const w of workers) byRole.set(w.role, (byRole.get(w.role) ?? 0) + 1);
      const parts = [...byRole.entries()].map(([r, n]) => `${n} ${r}${n > 1 ? "s" : ""}`);
      const busy = workers.filter((w) => w.status === "busy").length;
      return `The fleet has ${parts.join(", ")}. ${busy === 0 ? "Everyone is idle and ready." : `${busy} worker${busy > 1 ? "s are" : " is"} busy right now.`}`;
    }
    case "submitted": {
      const id = String(result.missionId ?? "?");
      const n = Number(result.sourceCount ?? 0);
      return `Mission ${id} is away. I dispatched the fleet across ${n} source${n === 1 ? "" : "s"}; fetchers are pulling now, analysts stand by. Say 'read me the report' when you want it, or 'how is it going' for a pulse check.`;
    }
    case "status": {
      if (Array.isArray(result)) {
        if (result.length === 0) return "No missions yet. The fleet is idle.";
        const running = result.filter((m) => m.status === "running").length;
        const done = result.filter((m) => m.status === "completed").length;
        return `Mission board: ${running} running, ${done} completed, ${result.length} total. Ask about a specific one with 'read me the report'.`;
      }
      const m = result as { id?: string; status?: string; progress?: string; goal?: string };
      return `Mission ${m.id ?? "?"} is ${m.status ?? "unknown"} — ${m.progress ?? "no tasks yet"}. Goal: ${m.goal ?? "unspecified"}.`;
    }
    case "cancelled": {
      return result.cancelled === true
        ? "Mission cancelled. The workers will stand down after their current task."
        : `I could not cancel that: ${JSON.stringify(result.error ?? "unknown mission")}`;
    }
    case "report": {
      const report = String(result.report ?? "");
      const status = String(result.status ?? "");
      if (status === "failed") return `The mission failed: ${String(result.error ?? "unknown error")}.`;
      if (!report) return `The mission is ${status}; no report yet — ask me again in a moment.`;
      return report;
    }
  }
}
