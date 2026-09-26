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
import { renderReply, type ToolPlan } from "../src/intents/router.js";
import { routeUtterance } from "../src/intents/llm.js";

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
  el.innerHTML = whoSpan(who);
  el.appendChild(document.createTextNode(text));
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

/** Speaker label with decorative console brackets hidden from assistive tech. */
function whoSpan(who: "user" | "alexa"): string {
  const label = who === "user" ? "You" : "Alexa+ · simulated";
  return `<span class="who"><i class="wb" aria-hidden="true">[</i>${label}<i class="wb" aria-hidden="true">]</i></span>`;
}

/** Report view: render the fleet briefing/audit as a structured document.
 *  Presentational parse only — the report text and the spoken copy are untouched. */
function addReportMsg(text: string) {
  const parsed = parseReport(text);
  const el = document.createElement("div");
  el.className = "msg alexa report";
  el.innerHTML = whoSpan("alexa");
  if (!parsed) {
    el.appendChild(document.createTextNode(text));
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return;
  }
  const box = document.createElement("div");
  box.className = "report";
  const head = document.createElement("div");
  head.className = "rep-head";
  head.innerHTML = `<span class="rep-tag">${parsed.kind}</span><span class="rep-goal">${escapeHtml(parsed.goal)}</span>`;
  box.appendChild(head);
  if (parsed.summary) {
    const s = document.createElement("p");
    s.className = "rep-summary";
    s.textContent = parsed.summary;
    box.appendChild(s);
  }
  if (parsed.terms) {
    const t = document.createElement("p");
    t.className = "rep-terms";
    t.textContent = parsed.terms;
    box.appendChild(t);
  }
  if (parsed.sources.length > 0) {
    const srcs = document.createElement("div");
    srcs.className = "rep-srcs";
    parsed.sources.forEach((src, i) => {
      srcs.appendChild(src);
      if (i >= 2 && parsed.sources.length > 3) src.classList.add("src-extra");
    });
    box.appendChild(srcs);
    if (parsed.sources.length > 3) {
      const more = document.createElement("button");
      more.className = "rep-more";
      more.setAttribute("aria-expanded", "false");
      more.textContent = `Show all ${parsed.sources.length} sources`;
      more.addEventListener("click", () => {
        const open = more.getAttribute("aria-expanded") === "true";
        more.setAttribute("aria-expanded", String(!open));
        more.textContent = open ? `Show all ${parsed.sources.length} sources` : "Collapse";
        box.querySelectorAll(".src-extra").forEach((n) => n.classList.toggle("src-open", !open));
      });
      box.appendChild(more);
    }
  }
  if (parsed.foot) {
    const f = document.createElement("div");
    f.className = "rep-foot";
    f.textContent = parsed.foot;
    box.appendChild(f);
  }
  el.appendChild(box);
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

type ParsedReport = {
  kind: "briefing" | "audit";
  goal: string;
  summary: string;
  terms?: string;
  sources: HTMLElement[];
  foot?: string;
};

function parseReport(text: string): ParsedReport | null {
  const lines = text.split("\n");
  const head = /^Fleet (briefing|audit): (.+)$/.exec(lines[0]?.trim() ?? "");
  if (!head) return null;
  const kind = head[1] as "briefing" | "audit";
  const goal = head[2];
  let summary = "";
  let terms: string | undefined;
  let foot: string | undefined;
  const sources: HTMLElement[] = [];
  let cur: HTMLElement | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const auditSrc = /^- \[(PASS|FAIL)\] (.+)$/.exec(line);
    const briefSrc = /^- (.+)$/.exec(line);
    const point = /^\s*\* (.+)$/.exec(line);
    if (auditSrc && kind === "audit") {
      const el = document.createElement("div");
      el.className = "src";
      const pass = auditSrc[1] === "PASS";
      el.innerHTML = `<span class="verdict ${pass ? "pass" : "fail"}">${auditSrc[1]}</span><span class="src-head">${escapeHtml(auditSrc[2])}</span>`;
      sources.push(el);
      cur = null;
      continue;
    }
    if (briefSrc && !line.startsWith("- [") && kind === "briefing") {
      if (briefSrc[1].startsWith("Unavailable:")) {
        const el = document.createElement("div");
        el.className = "src";
        el.innerHTML = `<span class="verdict fail">FAIL</span><span class="src-head">${escapeHtml(briefSrc[1])}</span>`;
        sources.push(el);
        cur = null;
        continue;
      }
      const el = document.createElement("div");
      el.className = "src";
      const m = /^(.+?) \((.+?)\) — (.+)$/.exec(briefSrc[1]);
      el.innerHTML = m
        ? `<div class="src-head">${escapeHtml(m[1])} <span class="src-meta">(${escapeHtml(m[2])}) — ${escapeHtml(m[3])}</span></div>`
        : `<div class="src-head">${escapeHtml(briefSrc[1])}</div>`;
      sources.push(el);
      cur = el;
      continue;
    }
    if (point && cur) {
      let ul = cur.querySelector("ul.src-points");
      if (!ul) {
        ul = document.createElement("ul");
        ul.className = "src-points";
        cur.appendChild(ul);
      }
      const li = document.createElement("li");
      li.textContent = point[1];
      ul.appendChild(li);
      continue;
    }
    const trimmed = line.trim();
    if (trimmed && !summary) summary = trimmed;
    else if (trimmed.startsWith("Terms repeated")) terms = trimmed;
    else if (trimmed.startsWith("Composited by")) foot = trimmed;
  }
  return { kind, goal, summary, terms, sources, foot };
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
  try {
    addMsg("user", text);
    const plan = await routeUtterance(text, { lastMissionId, missions: knownMissions });
    if ("reply" in plan) {
      addMsg("alexa", plan.reply);
      speak(plan.reply);
      return;
    }
    await runPlan(plan);
  } finally {
    planInFlight = false;
  }
}

/** True while a tool plan is in flight — duplicate submits are dropped (component-states async guard). */
let planInFlight = false;

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
    if (plan.speak === "report" && /^Fleet (briefing|audit): /.test(reply)) {
      addReportMsg(reply);
    } else {
      addMsg("alexa", reply);
    }
    speak(reply);
    if (plan.speak === "report") void refreshBoard();
  } catch (err) {
    const chip = chat.lastElementChild as HTMLElement | null;
    if (chip?.classList.contains("tool")) {
      chip.classList.add("err");
      const tag = chip.querySelector(".tool-tag");
      if (tag) tag.textContent = "ERR";
    }
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
  rosterEl.removeAttribute("aria-busy");
  rosterEl.innerHTML = "";
  if (workers.length === 0) {
    rosterEl.innerHTML = `<p class="empty">No workers reported.<span class="hint">Is the fleet engine running?</span></p>`;
    updateStats();
    return;
  }
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
        <span class="wdot ${w.status}" aria-hidden="true"></span>
        <span class="wid">${escapeHtml(w.id)}</span>
        <span class="wdone">${escapeHtml(w.status)} · ${w.tasksDone} done</span>`;
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
  missionsEl.removeAttribute("aria-busy");
  if (missions.length === 0) {
    missionsEl.innerHTML = `<p class="empty">No missions yet.<span class="hint">Say "brief me on the AI news corpus" to dispatch one.</span></p>`;
    updateStats();
    return;
  }
  missionsEl.innerHTML = "";
  missions.forEach((m, idx) => {
    const el = document.createElement("div");
    el.className = `mission${idx >= 3 ? " old" : ""}`;
    const dur = m.durationMs !== undefined ? ` · ${(Number(m.durationMs) / 1000).toFixed(1)}s` : "";
    const pct = missionPercent(m);
    el.innerHTML = `
      <div class="m-top"><span class="goal">${escapeHtml(String(m.goal ?? m.id))}</span><span class="badge s-${m.status}">${m.status}</span></div>
      <div class="m-meta">${m.id} · ${m.kind} · ${m.progress}${dur}</div>
      <div class="bar"><span class="fill ${m.status}" style="width:${pct}%"></span></div>`;
    missionsEl.appendChild(el);
  });
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
    ["workers", `${lastRoster.length}`, false],
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
  const ico = cls === "started" ? "i-chev" : cls === "completed" ? "i-check" : cls === "failed" ? "i-cross" : "i-dot";
  const detail = formatEvent(type, e);
  line.innerHTML = `<span class="t">${t}</span><span class="ico"><svg class="icon sm" aria-hidden="true"><use href="#${ico}"/></svg></span><span class="a">${escapeHtml(type)}</span><span class="d">${escapeHtml(detail)}</span>`;
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
  if (!text) {
    // Empty submit is not silent: return focus so the next keystroke lands in the field.
    utterance.focus();
    return;
  }
  if (planInFlight) return; // async guard: no duplicate dispatch while a plan runs
  utterance.value = "";
  planInFlight = true;
  void handleUtterance(text);
});

chips.addEventListener("click", (ev) => {
  const btn = (ev.target as HTMLElement).closest<HTMLElement>("button[data-say]");
  if (btn && !planInFlight) {
    planInFlight = true;
    void handleUtterance(btn.dataset.say ?? "");
  }
});

voiceBtn.addEventListener("click", () => {
  voiceOn = !voiceOn;
  voiceBtn.setAttribute("aria-pressed", voiceOn ? "true" : "false");
  if (voiceLabel) voiceLabel.textContent = voiceOn ? "voice on" : "voice off";
  const use = voiceBtn.querySelector("use");
  if (use) use.setAttribute("href", voiceOn ? "#i-voice-on" : "#i-voice-off");
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
    micBtn.setAttribute("aria-pressed", "true");
    rec.start();
  });
  rec.onresult = (e) => {
    const text = e.results[0]?.[0]?.transcript ?? "";
    if (text) { utterance.value = text; void handleUtterance(text); utterance.value = ""; }
  };
  rec.onend = () => { listening = false; micBtn.classList.remove("rec"); micBtn.setAttribute("aria-pressed", "false"); };
} else {
  micBtn.style.display = "none";
}

void connect().then(async () => {
  // refresh AFTER the session is live — the old cold-load order left the missions
  // pane skeleton-hung because refreshBoard raced (and lost to) connect().
  void refreshBoard();
  // ?autodemo=1: run one hands-free mission on load (demo video / screenshot path).
  if (new URLSearchParams(window.location.search).has("autodemo")) {
    await new Promise((r) => setTimeout(r, 600));
    await handleUtterance("Brief me on the AI news corpus.");
    await new Promise((r) => setTimeout(r, 2500));
    await handleUtterance("Read me the report.");
  }
});
