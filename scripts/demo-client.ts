/**
 * Fleetline CLI demo client — proves the full MCP path end to end:
 * connects over Streamable HTTP (official SDK client), lists tools,
 * dispatches a real mission, streams fleet events as they arrive,
 * then collects the report. Run `npm start` first, then `npm run demo`.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { LoggingMessageNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

const BASE = process.env.FLEETLINE_URL ?? "http://127.0.0.1:3000";
const log = (s: string) => process.stdout.write(s + "\n");

const client = new Client({ name: "fleetline-demo", version: "1.0.0" });

client.setNotificationHandler(LoggingMessageNotificationSchema, (n) => {
  const e = n.params.data as Record<string, unknown>;
  const label =
    e.type === "task_started" || e.type === "task_completed" || e.type === "task_failed"
      ? `${e.workerId} ${e.label}`
      : e.type === "mission_created"
        ? `"${e.goal}" (${e.sourceCount} sources)`
        : e.type === "mission_completed"
          ? `"${e.goal}" in ${e.durationMs}ms`
          : e.type === "mission_failed"
            ? String(e.error ?? "")
            : "";
  log(`  [fleet] ${String(e.type).padEnd(17)} ${label}`);
});

function parse(res: unknown): Record<string, unknown> {
  const r = res as { content?: Array<{ type: string; text?: string }> };
  const first = r.content?.find((c) => c.type === "text");
  if (first?.text) {
    try { return JSON.parse(first.text); } catch { /* fall through */ }
  }
  return {};
}

async function main() {
  log(`fleetline demo client — ${BASE}/mcp`);
  const transport = new StreamableHTTPClientTransport(new URL("/mcp", BASE));
  await client.connect(transport);
  log("connected: MCP session established over Streamable HTTP");

  const tools = await client.listTools();
  log(`server exposes ${tools.tools.length} tools: ${tools.tools.map((t) => t.name).join(", ")}`);

  log("\ndispatching briefing mission on the bundled corpus (fully offline)…");
  const submit = parse(
    await client.callTool({
      name: "fleet_mission_submit",
      arguments: { goal: "demo briefing: what does the corpus say", kind: "briefing" },
    })
  );
  const missionId = String(submit.missionId);
  log(`mission away: ${missionId} across ${submit.sourceCount} sources; live fleet events below\n`);

  const collected = parse(
    await client.callTool({ name: "fleet_collect", arguments: { missionId, wait: true } })
  );
  log(`\nmission ${missionId}: ${collected.status} (${collected.durationMs}ms)`);
  log("\n----- report -----\n");
  log(String(collected.report));
  log("\n------------------");

  const status = parse(await client.callTool({ name: "fleet_status", arguments: {} }));
  const board = (status as unknown as Array<Record<string, unknown>>).map((m) => ({ id: m.id, status: m.status }));
  log(`\nmission board: ${JSON.stringify(board)}`);

  const roster = parse(await client.callTool({ name: "fleet_roster", arguments: {} }));
  const workers = (roster.workers ?? []) as Array<{ id: string; role: string; tasksDone: number }>;
  log(`roster: ${workers.map((w) => `${w.id}(${w.tasksDone})`).join(" ")}`);

  await client.close();
  log("\ndemo complete: submit → parallel fetch/analyze → compose → collect, all over MCP Streamable HTTP");
}

main().catch((err) => {
  log(`demo failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
  process.exit(1);
});
