/**
 * Fleetline web simulator — the "simulated Alexa+ experience" the Alexa+
 * track sanctions for builders without device access.
 *
 * It is a real MCP client: this bundle connects to the Fleetline MCP server
 * over Streamable HTTP (the official SDK's browser-compatible client), calls
 * fleet tools, and renders live fleet events from MCP logging notifications.
 * A deterministic router (src/intents/router.ts) stands in for the Alexa+
 * model's tool selection; everything else is the real protocol path.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { LoggingMessageNotificationSchema } from "@modelcontextprotocol/sdk/types.js";
import { renderReply, routeIntent, type ToolPlan } from "../src/intents/router.js";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

const chat = $("chat");
const utterance = $<HTMLInputElement>("utterance");
const composer = $("composer");
const chips = $("chips");
const rosterEl = $("roster");
const missionsEl = $("missions");
const feedEl = $("feed");
const connEl = $("conn");
const connText = $("conn-text");
const missionCount = $("mission-count");
const statsEl = $("stats");
const voiceBtn = $<HTMLButtonElement>("voice-btn");
const voiceLabel = voiceBtn.querySelector<HTMLElement>(".voice-label");
const micBtn = $<HTMLButtonElement>("mic");

let voiceOn = true;
let lastMissionId: string | undefined;
const knownMissions = new Map<string, string>();

/** Presentational caches for the stat strip (visual aggregation only). */
type RosterWorker = { id: string; role: string; status: string; tasksDone: number };
let lastRoster: RosterWorker[] = [];
let lastMissions: Array<Record<string, unknown>> = [];
let eventCount = 0;

const client = new Client({ name: "fleetline-simulator", version: "1.0.0" });

client.setNotificationHandler(LoggingMessageNotificationSchema, (notification) => {
  const data = notification.params.data as Record<string, unknown> | undefined;
  if (data) onFleetEvent(data);
});

function setConn(state: "up" | "down" | "wait", text: string) {
  connEl.className = `conn ${state}`;
  connText.textContent = text;
}

async function connect(): Promise<void> {
  try {
    const transport = new StreamableHTTPClientTransport(new URL("/mcp", window.location.href), {
      requestInit: { headers: { accept: "text/event-stream" } },
    });
    await client.connect(transport);
    setConn("up", `MCP session live (Streamable HTTP)`);
    sysMsg(`Connected to the Fleetline MCP server over Streamable HTTP. Say 'brief me on the AI news corpus' to dispatch the fleet.`);
    void refreshRoster();
  } catch (err) {
    setConn("down", "MCP server unreachable — is `npm start` running?");
    sysMsg(`Could not connect: ${(err as Error).message}`);
  }
}

/* ---------- conversation ---------- */

function addMsg(who: "user" | "alexa", text: string) {
  const el = document.createElement("div");
  el.className = `msg ${who}`;
  el.innerHTML = `<span class="who">${who === "user" ? "You" : "Alexa+ · simulated"}</span>`;
  el.appendChild(document.createTextNode(text));
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function sysMsg(text: string) {
  const el = document.createElement("div");
  el.className = "msg system";
  el.textContent = text;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function toolMsg(tool: string, args: Record<string, unknown>) {
  const el = document.createElement("div");
  el.className = "msg tool";
  el.innerHTML =
    `<span class="tool-tag">MCP</span>` +
    `<span class="tool-name">tools/call ${escapeHtml(tool)}</span>` +
    `<span class="tool-args">${escapeHtml(JSON.stringify(args))}</span>`;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function speak(text: string) {
  if (!voiceOn || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text.length > 900 ? text.slice(0, 900) : text);
  u.rate = 1.03;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

async function handleUtterance(text: string) {
  addMsg("user", text);
  const plan = routeIntent(text, { lastMissionId, missions: knownMissions });
  if ("reply" in plan) {
    addMsg("alexa", plan.reply);
    speak(plan.reply);
    return;
  }
  await runPlan(plan);
}

async function runPlan(plan: ToolPlan) {
  toolMsg(plan.tool, plan.args);
  try {
    const res = await client.callTool({ name: plan.tool, arguments: plan.args });
    const payload = parseResult(res);
    const reply = renderReply(plan, payload);
    if (payload.missionId) {
      lastMissionId = String(payload.missionId);
      knownMissions.set(lastMissionId, String(payload.goal ?? ""));
    }
    if (Array.isArray(payload)) {
      for (const m of payload as Array<{ id: string; goal: string }>) knownMissions.set(m.id, m.goal);
    }
    addMsg("alexa", reply);
    speak(reply);
    if (plan.speak === "report") void refreshBoard();
  } catch (err) {
    addMsg("alexa", `That tool call failed: ${(err as Error).message}`);
  }
}

function parseResult(res: unknown): Record<string, unknown> {
  const r = res as { content?: Array<{ type: string; text?: string }> };
  const first = r.content?.find((c) => c.type === "text");
  if (first?.text) {
    try { return JSON.parse(first.text); } catch { /* fall through */ }
  }
  return { raw: first?.text ?? "" };
}

/* ---------- dashboard ---------- */

async function refreshRoster() {
  try {
    const res = await client.callTool({ name: "fleet_roster", arguments: {} });
    const payload = parseResult(res) as { workers?: Array<{ id: string; role: string; status: string; tasksDone: number }> };
    renderRoster(payload.workers ?? []);
  } catch { /* server gone; connection banner already reflects it */ }
}

function renderRoster(workers: RosterWorker[]) {
  lastRoster = workers;
  rosterEl.innerHTML = "";
  const groups = new Map<string, RosterWorker[]>();
  for (const w of workers) {
    const arr = groups.get(w.role) ?? [];
    arr.push(w);
    groups.set(w.role, arr);
  }
  for (const [role, list] of groups) {
    const group = document.createElement("div");
    group.className = "role-group";
    group.innerHTML = `<div class="role-name">${escapeHtml(role)}<span class="role-count">×${list.length}</span></div>`;
    const rows = document.createElement("div");
    rows.className = "role-workers";
    for (const w of list) {
      const el = document.createElement("div");
      el.className = "worker";
      el.innerHTML = `
        <span class="wdot ${w.status}" title="${w.status}"></span>
        <span class="wid">${escapeHtml(w.id)}</span>
        <span class="wdone">${w.tasksDone} done</span>`;
      rows.appendChild(el);
    }
    group.appendChild(rows);
    rosterEl.appendChild(group);
  }
  updateStats();
}

async function refreshBoard() {
  try {
    const res = await client.callTool({ name: "fleet_status", arguments: {} });
    const missions = parseResult(res);
    if (Array.isArray(missions)) renderMissions(missions as Array<Record<string, unknown>>);
    void refreshRoster();
  } catch { /* ignore */ }
}

function renderMissions(missions: Array<Record<string, unknown>>) {
  lastMissions = missions;
  missionCount.textContent = `${missions.length} mission${missions.length === 1 ? "" : "s"}`;
  if (missions.length === 0) {
    missionsEl.innerHTML = `<p class="empty">No missions yet.</p>`;
    updateStats();
    return;
  }
  missionsEl.innerHTML = "";
  for (const m of missions) {
    const el = document.createElement("div");
    el.className = "mission";
    const dur = m.durationMs !== undefined ? ` · ${(Number(m.durationMs) / 1000).toFixed(1)}s` : "";
    const pct = missionPercent(m);
    el.innerHTML = `
      <div class="m-top"><span class="goal">${escapeHtml(String(m.goal ?? m.id))}</span><span class="badge s-${m.status}">${m.status}</span></div>
      <div class="m-meta">${m.id} · ${m.kind} · ${m.progress}${dur}</div>
      <div class="bar"><span class="fill ${m.status}" style="width:${pct}%"></span></div>`;
    missionsEl.appendChild(el);
  }
  updateStats();
}

/** Truthful progress percentage from taskStats (fallback: "3/12 tasks" string). */
function missionPercent(m: Record<string, unknown>): number {
  const stats = m.taskStats as { total?: number; completed?: number; failed?: number } | undefined;
  if (stats && Number(stats.total) > 0) {
    const done = Number(stats.completed ?? 0) + Number(stats.failed ?? 0);
    return Math.round((done / Number(stats.total)) * 100);
  }
  const match = /(\d+)\/(\d+)/.exec(String(m.progress ?? ""));
  if (match && Number(match[2]) > 0) return Math.round((Number(match[1]) / Number(match[2])) * 100);
  return m.status === "completed" ? 100 : 0;
}

/** Stat strip: pure visual aggregation of already-fetched data. */
function updateStats() {
  if (!statsEl) return;
  const busy = lastRoster.filter((w) => w.status === "busy").length;
  const cells: Array<[string, string, boolean?]> = [
    ["fleet workers", `${lastRoster.length}`, false],
    ["busy now", `${busy}`, busy > 0],
    ["missions", `${lastMissions.length}`, false],
    ["fleet events", `${eventCount}`, false],
  ];
  statsEl.innerHTML = cells
    .map(([k, v, hot]) => `<div class="stat${hot ? " busy-live" : ""}"><span class="v">${v}</span><span class="k">${k}</span></div>`)
    .join("");
}

function onFleetEvent(e: Record<string, unknown>) {
  if (feedEl.querySelector(".empty")) feedEl.innerHTML = "";
  const type = String(e.type ?? "event");
  const cls = type.includes("completed") ? "completed" : type.includes("started") ? "started" : type.includes("failed") ? "failed" : "";
  const t = new Date(Number(e.ts ?? Date.now())).toLocaleTimeString();
  const line = document.createElement("div");
  line.className = `evt ${cls}`;
  const ico = cls === "started" ? "▸" : cls === "completed" ? "✓" : cls === "failed" ? "✕" : "·";
  const detail = formatEvent(type, e);
  line.innerHTML = `<span class="t">${t}</span><span class="ico">${ico}</span><span class="a">${escapeHtml(type)}</span><span class="d">${escapeHtml(detail)}</span>`;
  feedEl.prepend(line);
  eventCount += 1;
  updateStats();
  while (feedEl.children.length > 60) feedEl.lastChild?.remove();

  if (type.startsWith("task_") || type.startsWith("mission_")) {
    void refreshBoard();
  }
}

function formatEvent(type: string, e: Record<string, unknown>): string {
  switch (type) {
    case "mission_created": return `"${e.goal}" (${e.kind}, ${e.sourceCount} sources)`;
    case "task_started":
    case "task_completed": return `${e.workerId} ${e.label}${type === "task_completed" ? ` (${Number(e.durationMs)}ms)` : ""}`;
    case "task_failed": return `${e.workerId} ${e.label} — ${e.error}`;
    case "mission_completed": return `"${e.goal}" in ${Number(e.durationMs)}ms`;
    case "mission_failed": return String(e.error ?? "");
    case "mission_cancelled": return `mission ${e.missionId ?? ""}`;
    default: {
      const worker = e.workerId ? `${e.workerId} ` : "";
      const label = e.label ? String(e.label) : e.missionId ? `mission ${e.missionId}` : "";
      return `${worker}${label}`.trim();
    }
  }
}

function escapeHtml(s: string): string {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

/* ---------- input wiring ---------- */

composer.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const text = utterance.value.trim();
  if (!text) return;
  utterance.value = "";
  void handleUtterance(text);
});

chips.addEventListener("click", (ev) => {
  const btn = (ev.target as HTMLElement).closest<HTMLElement>("button[data-say]");
  if (btn) void handleUtterance(btn.dataset.say ?? "");
});

voiceBtn.addEventListener("click", () => {
  voiceOn = !voiceOn;
  voiceBtn.setAttribute("aria-pressed", voiceOn ? "true" : "false");
  if (voiceLabel) voiceLabel.textContent = voiceOn ? "voice on" : "voice off";
  if (!voiceOn && "speechSynthesis" in window) speechSynthesis.cancel();
});

// Optional voice input via the browser's speech recognition (Chrome).
type SpeechCtor = new () => { lang: string; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };
const SR = (window as unknown as { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor }).SpeechRecognition
  ?? (window as unknown as { webkitSpeechRecognition?: SpeechCtor }).webkitSpeechRecognition;

if (SR) {
  const rec = new SR();
  rec.lang = "en-US";
  let listening = false;
  micBtn.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (listening) { rec.stop(); return; }
    listening = true;
    micBtn.classList.add("rec");
    rec.start();
  });
  rec.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript ?? "";
    if (text) { utterance.value = text; void handleUtterance(text); utterance.value = ""; }
  };
  rec.onend = () => { listening = false; micBtn.classList.remove("rec"); };
} else {
  micBtn.style.display = "none";
}

void connect().then(async () => {
  // ?autodemo=1: run one hands-free mission on load (demo video / screenshot path).
  if (new URLSearchParams(window.location.search).has("autodemo")) {
    await new Promise((r) => setTimeout(r, 600));
    await handleUtterance("Brief me on the AI news corpus.");
    await new Promise((r) => setTimeout(r, 2500));
    await handleUtterance("Read me the report.");
  }
});
void refreshBoard();
