/**
 * Optional local-model intent lane.
 *
 * When FLEETLINE_INTENT_URL points at an OpenAI-compatible endpoint (LM
 * Studio, Ollama's compat layer, llama.cpp server), tool selection runs on
 * that model instead of the deterministic keyword router. Any failure — no
 * env var, timeout, HTTP error, malformed JSON — falls back to the
 * deterministic router, so the simulator never gets stuck waiting on a
 * model. Transport, tools, fleet, and events are identical either way.
 */

import { routeIntent, type RouterDeps, type ToolPlan } from "./router.js";

const TOOLS = [
  "fleet_roster",
  "fleet_mission_submit",
  "fleet_status",
  "fleet_collect",
  "fleet_cancel",
] as const;

const SPEAK_BY_TOOL: Record<string, ToolPlan["speak"]> = {
  fleet_roster: "roster",
  fleet_mission_submit: "submitted",
  fleet_status: "status",
  fleet_collect: "report",
  fleet_cancel: "cancelled",
};

const SYSTEM_PROMPT = [
  "You map a user utterance to one tool call for a local agent fleet.",
  'Reply with ONLY minified JSON, no prose:',
  '{"tool":"fleet_roster|fleet_mission_submit|fleet_status|fleet_collect|fleet_cancel","goal":string,"kind":"briefing|audit","sources":string[],"missionId":string}',
  "For fleet_mission_submit: goal is the cleaned mission request (max 80 chars); kind is audit only when the user asks to check/audit source health; sources lists any http(s) URLs from the utterance (max 8).",
  "For fleet_status / fleet_collect / fleet_cancel: missionId may be omitted when the utterance says 'the mission' — the caller substitutes the active mission.",
  "If no tool fits the utterance, reply {\"reply\":\"<one helpful sentence>\"}.",
].join("\n");

interface LLMPlan {
  tool?: string;
  goal?: string;
  kind?: string;
  sources?: unknown;
  missionId?: string;
  reply?: string;
}

function coercePlan(raw: LLMPlan, utterance: string, deps: RouterDeps): ToolPlan | { reply: string } | null {
  if (raw.reply && typeof raw.reply === "string") return { reply: raw.reply };
  const tool = TOOLS.find((t) => t === raw.tool);
  if (!tool) return null;

  if (tool === "fleet_mission_submit") {
    const kind = raw.kind === "audit" ? "audit" : "briefing";
    const goal = typeof raw.goal === "string" && raw.goal.trim() ? raw.goal.trim().slice(0, 80) : utterance.trim().slice(0, 80) || "fleet briefing";
    const args: Record<string, unknown> = {
      goal: kind === "audit" ? `Audit source health: ${goal.replace(/^audit source health:\s*/i, "")}` : goal,
      kind,
    };
    const urls = Array.isArray(raw.sources)
      ? raw.sources.filter((s): s is string => typeof s === "string" && /^https?:\/\//.test(s)).slice(0, 8)
      : [];
    if (urls.length > 0) args.sources = urls;
    return { tool, args, speak: "submitted" };
  }

  const args: Record<string, unknown> = {};
  const id = typeof raw.missionId === "string" && /^m-\d{3}$/.test(raw.missionId) ? raw.missionId : deps.lastMissionId;
  if (tool === "fleet_collect") {
    if (!id) return { reply: "I do not have a mission to report on yet. Try: brief me on the AI news corpus." };
    args.missionId = id;
    args.wait = true;
  }
  if ((tool === "fleet_status" || tool === "fleet_cancel") && id) args.missionId = id;
  if (tool === "fleet_cancel" && !id) {
    return { reply: "There is no mission in flight to cancel. Submit one with 'brief me on' plus a topic." };
  }
  return { tool, args, speak: SPEAK_BY_TOOL[tool] };
}

function parseModelJson(text: string): LLMPlan | null {
  const stripped = text.replace(/```(?:json)?/gi, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1)) as LLMPlan;
  } catch {
    return null;
  }
}

/**
 * LLM-first intent routing with deterministic fallback. Returns the same
 * shapes as routeIntent so callers need no other change than an await.
 */
export async function routeUtterance(utterance: string, deps: RouterDeps): Promise<ToolPlan | { reply: string }> {
  // globalThis guard: `process` does not exist in the browser bundle, where a
  // bare process.env reference throws before any utterance can route.
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const base = env?.FLEETLINE_INTENT_URL?.replace(/\/+$/, "");
  if (base) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: env?.FLEETLINE_INTENT_MODEL || "local",
          temperature: 0,
          max_tokens: 200,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: deps.lastMissionId ? `${utterance}\n(active mission: ${deps.lastMissionId})` : utterance },
          ],
        }),
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const plan = coercePlan(parseModelJson(content) ?? {}, utterance, deps);
          if (plan) return plan;
        }
      }
    } catch {
      // fall through to the deterministic router
    }
  }
  return routeIntent(utterance, deps);
}
