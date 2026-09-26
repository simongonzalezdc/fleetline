import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { routeUtterance } from "../src/intents/llm.js";

function stubLLM(port: number, body: unknown, status = 200) {
  return new Promise<void>((resolve) => {
    const srv = createServer((req, res) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
      void srv.close();
    });
    srv.listen(port, "127.0.0.1", () => resolve());
  });
}

test("llm lane maps a model plan to the same ToolPlan shape as the router", async () => {
  await stubLLM(39871, {
    choices: [{ message: { content: '{"tool":"fleet_mission_submit","goal":"brief me on AI news","kind":"briefing","sources":["https://example.com"]}' } }],
  });
  process.env.FLEETLINE_INTENT_URL = "http://127.0.0.1:39871/v1";
  const plan = await routeUtterance("brief me on AI news, and check https://example.com", {});
  delete process.env.FLEETLINE_INTENT_URL;
  assert.ok("tool" in plan);
  assert.equal(plan.tool, "fleet_mission_submit");
  assert.equal(plan.speak, "submitted");
  assert.deepEqual(plan.args.sources, ["https://example.com"]);
});

test("llm failure falls back to the deterministic router", async () => {
  await stubLLM(39872, { error: "boom" }, 500);
  process.env.FLEETLINE_INTENT_URL = "http://127.0.0.1:39872/v1";
  const plan = await routeUtterance("cancel it", { lastMissionId: "m-001" });
  delete process.env.FLEETLINE_INTENT_URL;
  assert.ok("tool" in plan);
  assert.equal(plan.tool, "fleet_cancel");
  assert.deepEqual(plan.args, { missionId: "m-001" });
});

test("no env var keeps the deterministic path untouched", async () => {
  delete process.env.FLEETLINE_INTENT_URL;
  const plan = await routeUtterance("brief me on the AI news corpus", {});
  assert.ok("tool" in plan);
  assert.equal(plan.tool, "fleet_mission_submit");
});
