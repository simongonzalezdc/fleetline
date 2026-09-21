import { test } from "node:test";
import assert from "node:assert/strict";
import { FleetManager, summarize } from "../src/fleet/manager.js";
import { defaultSources } from "../src/fleet/corpus.js";
import type { FleetEvent } from "../src/fleet/types.js";

function newManager() {
  return new FleetManager();
}

function refs() {
  return defaultSources().map((ref) => ({ ref, label: ref.replace("corpus:", "") }));
}

test("roster has role-specialized workers", () => {
  const m = newManager();
  const roles = new Set(m.roster().map((w) => w.role));
  assert.deepEqual([...roles].sort(), ["analyst", "composer", "fetcher"]);
});

test("briefing mission completes with a report and full event trail", async () => {
  const m = newManager();
  const events: FleetEvent[] = [];
  m.onEvent((e) => events.push(e));

  const mission = await m.submit({ goal: "test briefing", kind: "briefing", sources: refs() });
  const done = await m.waitFor(mission.id, 10_000);
  assert.ok(done);
  assert.equal(done.status, "completed");
  assert.ok(done.report && done.report.includes("Fleet briefing"));
  assert.equal(done.analyses.length, 4);
  assert.ok(done.tasks.length >= 9); // 4 fetch + 4 analyze + 1 compose

  const types = events.map((e) => e.type);
  assert.ok(types.includes("mission_created"));
  assert.ok(types.includes("task_started"));
  assert.ok(types.filter((t) => t === "task_completed").length >= 9);
  assert.equal(types[types.length - 1], "mission_completed");

  const s = summarize(done);
  assert.equal(s.taskStats.completed, done.tasks.length);
});

test("audit mission checks source health", async () => {
  const m = newManager();
  const mission = await m.submit({
    goal: "audit test",
    kind: "audit",
    sources: [{ ref: "corpus:ai-news", label: "ai" }, { ref: "https://127.0.0.1:9/definitely-not-listening", label: "dead" }],
  });
  const done = await m.waitFor(mission.id, 15_000);
  assert.ok(done);
  assert.equal(done.status, "completed");
  assert.ok(done.report!.includes("PASS"));
  assert.ok(done.report!.includes("FAIL"));
});

test("cancel stops a queued/running mission", async () => {
  const m = newManager();
  const mission = await m.submit({ goal: "to cancel", kind: "briefing", sources: refs() });
  m.cancel(mission.id);
  const done = await m.waitFor(mission.id, 5_000);
  assert.ok(done);
  assert.equal(done.status, "cancelled");
  assert.equal(done.report, undefined);
});

test("unknown corpus ref fails that source but mission survives", async () => {
  const m = newManager();
  const mission = await m.submit({
    goal: "partial",
    kind: "briefing",
    sources: [{ ref: "corpus:nope", label: "bad" }, ...refs().slice(0, 1)],
  });
  const done = await m.waitFor(mission.id, 10_000);
  assert.ok(done);
  assert.equal(done.status, "completed");
  assert.equal(done.analyses.length, 1);
});

test("status lists recent missions and summarizes progress", async () => {
  const m = newManager();
  await m.submit({ goal: "a", kind: "briefing", sources: refs() });
  await m.submit({ goal: "b", kind: "audit", sources: refs().slice(0, 2) });
  const list = m.status() as ReturnType<typeof summarize>[];
  assert.equal(list.length, 2);
  assert.ok(list[0].goal === "b" || list[1].goal === "b");
});
