/**
 * The MCP surface of Fleetline. Exposes fleet operations as MCP tools and
 * bridges fleet events into MCP logging notifications ("notifications/message")
 * so any MCP client over Streamable HTTP sees live mission progress.
 *
 * One McpServer instance is created per client session (stateful Streamable
 * HTTP pattern); all sessions share a single FleetManager.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { FleetEvent } from "./fleet/types.js";
import type { FleetManager } from "./fleet/manager.js";
import { CORPUS, defaultSources } from "./fleet/corpus.js";

export const SERVER_INFO = {
  name: "fleetline",
  version: "1.0.0",
} as const;

function text(payload: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
}

const CORPUS_HELP = CORPUS.map((e) => `corpus:${e.key} (${e.label})`).join(", ");

export function createMcpServer(manager: FleetManager): McpServer {
  const server = new McpServer(SERVER_INFO, {
    // Declaring the logging capability lets us stream fleet progress to
    // clients as notifications/message over the session's SSE stream.
    capabilities: { logging: {} },
    instructions: [
      "Fleetline commands a local agent fleet: submit a mission (fetch + analyze + compose),",
      "poll status, collect the finished report, or cancel. Progress arrives as",
      "logging notifications on this session. Sources are http(s) URLs or bundled corpus refs:",
      CORPUS_HELP + ".",
    ].join(" "),
  });

  // Bridge fleet events to this session as MCP logging notifications.
  const detach = manager.onEvent((event: FleetEvent) => {
    if (process.env.FLEETLINE_DEBUG) {
      console.error(`[debug] notifying session of ${event.type}`);
    }
    void server.server
      .notification({
        method: "notifications/message",
        params: { level: "info", logger: "fleet", data: event },
      })
      .then(() => {
        if (process.env.FLEETLINE_DEBUG) console.error(`[debug] notification sent: ${event.type}`);
      })
      .catch((err) => {
        console.error(`[fleetline] notification failed: ${event.type}:`, err instanceof Error ? err.message : err);
      });
  });
  const prevOnClose = server.server.onclose;
  server.server.onclose = () => {
    detach();
    prevOnClose?.();
  };

  server.registerTool(
    "fleet_roster",
    {
      title: "Fleet roster",
      description:
        "List the fleet's workers (id, role, status, tasks completed). Use to answer 'who is in the fleet' or 'is anyone busy'.",
      inputSchema: {},
    },
    async () => text({ workers: manager.roster() })
  );

  server.registerTool(
    "fleet_mission_submit",
    {
      title: "Submit a mission to the fleet",
      description:
        "Dispatch a mission to the agent fleet and get its id immediately. Kind 'briefing' fetches sources, analyzes each in parallel, and composes one report; kind 'audit' checks source health. Omit sources to use the bundled corpus. Follow with fleet_status / fleet_collect.",
      inputSchema: {
        goal: z.string().min(3).describe("What the fleet should accomplish, e.g. 'brief me on today's AI news'"),
        kind: z.enum(["briefing", "audit"]).default("briefing").describe("Mission type"),
        sources: z
          .array(z.string())
          .max(8)
          .optional()
          .describe(`http(s) URLs or corpus refs: ${CORPUS_HELP}. Omit for the full corpus.`),
      },
    },
    async ({ goal, kind, sources }) => {
      const refs = (sources ?? defaultSources()).map((ref) => ({
        ref,
        label: ref.startsWith("corpus:")
          ? CORPUS.find((c) => `corpus:${c.key}` === ref)?.label ?? ref
          : safeHost(ref),
      }));
      const mission = await manager.submit({ goal, kind, sources: refs });
      return text({
        missionId: mission.id,
        status: mission.status,
        sourceCount: refs.length,
        hint: `Watch for fleet progress notifications, then call fleet_collect with missionId ${mission.id}.`,
      });
    }
  );

  server.registerTool(
    "fleet_status",
    {
      title: "Fleet status",
      description:
        "Check mission progress. With no missionId, list recent missions. Use to answer 'how is the fleet doing'.",
      inputSchema: {
        missionId: z.string().optional(),
      },
    },
    async ({ missionId }) => text(manager.status(missionId) ?? { error: "unknown mission" })
  );

  server.registerTool(
    "fleet_collect",
    {
      title: "Collect a mission report",
      description:
        "Collect the finished report for a mission. Waits for completion by default (up to 60s) so a single call can submit-and-collect in conversation.",
      inputSchema: {
        missionId: z.string(),
        wait: z.boolean().default(true).describe("Wait for completion (up to 60s) instead of returning immediately"),
      },
    },
    async ({ missionId, wait }) => {
      let mission = manager.getMission(missionId);
      if (!mission) return text({ error: `unknown mission ${missionId}` });
      if (wait && (mission.status === "running" || mission.status === "queued")) {
        mission = (await manager.waitFor(missionId, 60_000)) ?? mission;
      }
      if (mission.status === "running" || mission.status === "queued") {
        return text({ missionId, status: mission.status, note: "still running; call fleet_collect again" });
      }
      return text({
        missionId,
        status: mission.status,
        goal: mission.goal,
        durationMs: mission.endedAt !== undefined ? mission.endedAt - mission.createdAt : undefined,
        report: mission.report ?? "",
        error: mission.error ?? null,
      });
    }
  );

  server.registerTool(
    "fleet_cancel",
    {
      title: "Cancel a mission",
      description: "Cancel a queued or running mission. Workers finish their current task, then stop.",
      inputSchema: {
        missionId: z.string(),
      },
    },
    async ({ missionId }) =>
      text(manager.cancel(missionId) ? { missionId, cancelled: true } : { error: "unknown mission" })
  );

  return server;
}

function safeHost(ref: string): string {
  try {
    return new URL(ref).host;
  } catch {
    return ref.slice(0, 40);
  }
}
