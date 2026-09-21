/**
 * End-to-end integration test: boots the real HTTP server as a child process
 * on an ephemeral port, then drives it with the official SDK client over
 * Streamable HTTP — initialize session, list tools, submit a mission,
 * receive fleet events as logging notifications, collect the report,
 * and terminate the session with DELETE semantics via client.close().
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { LoggingMessageNotificationSchema } from "@modelcontextprotocol/sdk/types.js";

const SERVER = join(fileURLToPath(new URL(".", import.meta.url)), "..", "src", "index.js");

async function startServer(): Promise<{ url: string; stop: () => void }> {
  const port = 3000 + Math.floor(Math.random() * 2000);
  const child = spawn(process.execPath, [SERVER], {
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stderr.on("data", (d) => process.stderr.write(`[server] ${d}`));
  // Poll until the HTTP server accepts connections.
  const deadline = Date.now() + 10_000;
  for (;;) {
    try {
      const probe = await fetch(`http://127.0.0.1:${port}/`, { method: "GET" });
      if (probe.status === 200) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) throw new Error("server did not start in 10s");
    await new Promise((r) => setTimeout(r, 150));
  }
  return {
    url: `http://127.0.0.1:${port}`,
    stop: () => child.kill("SIGTERM"),
  };
}

function parse(res: unknown): Record<string, unknown> {
  const r = res as { content?: Array<{ type: string; text?: string }> };
  const first = r.content?.find((c) => c.type === "text");
  if (first?.text) {
    try { return JSON.parse(first.text); } catch { /* fall through */ }
  }
  return {};
}

test("full MCP lifecycle over Streamable HTTP", async (t) => {
  const server = await startServer();
  t.after(() => server.stop());

  const client = new Client({ name: "fleetline-integration-test", version: "1.0.0" });
  const events: string[] = [];
  client.setNotificationHandler(LoggingMessageNotificationSchema, (n) => {
    const e = n.params.data as Record<string, unknown>;
    events.push(String(e.type));
  });

  await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", server.url)));

  const { tools } = await client.listTools();
  assert.deepEqual(
    tools.map((tool) => tool.name).sort(),
    ["fleet_cancel", "fleet_collect", "fleet_mission_submit", "fleet_roster", "fleet_status"]
  );

  const roster = parse(await client.callTool({ name: "fleet_roster", arguments: {} }));
  const workers = roster.workers as Array<{ id: string; role: string }>;
  assert.equal(workers.length, 8);

  const submit = parse(
    await client.callTool({
      name: "fleet_mission_submit",
      arguments: { goal: "integration test briefing", kind: "briefing", sources: ["corpus:ai-news", "corpus:sleep-research"] },
    })
  );
  const missionId = String(submit.missionId);
  assert.match(missionId, /^m-\d{3}$/);

  const collected = parse(
    await client.callTool({ name: "fleet_collect", arguments: { missionId, wait: true } })
  );
  assert.equal(collected.status, "completed");
  assert.ok(String(collected.report).includes("Fleet briefing"));
  assert.ok(Number(collected.durationMs) >= 0);

  // Fleet events must have arrived on the same session as notifications.
  assert.ok(events.includes("mission_created"), `got events: ${events.join(",")}`);
  assert.ok(events.includes("mission_completed"));

  const board = parse(await client.callTool({ name: "fleet_status", arguments: {} }));
  assert.ok(Array.isArray(board) && board.length >= 1);

  await client.close();
});
