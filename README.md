# Fleetline

**Command an agent fleet by voice.** Fleetline is a self-hosted MCP server +
Agent Skill that turns a voice assistant (Alexa+) into the operator of a local
agent fleet: dispatch missions, watch workers execute in parallel, collect the
report — hands-free.

Built for the **Alexa+ track** of the Amazon *Build, Ship, Shape* hackathon
(2026), on the two open standards the track names: **MCP Streamable HTTP
transport** (spec 2025-11-25) and **Agent Skills**.

**Watch the demo (70 s): https://www.youtube.com/watch?v=XOnOJ9aU4Os**

```
 you (voice)          simulated Alexa+              Fleetline MCP server            agent fleet
 ──────────►  intent ────────────────► tools/call ───────────────────►  fetcher-01 ─┐
              (web app, per track     over Streamable HTTP              fetcher-02 ─┼─ parallel
               guidance for builders  POST /mcp + GET SSE               analyst-01 ─┘
               without device access)                                   composer-01 → report
                       ◄──────────── notifications/message ◄────────────  (live events)
```

## What it does

- **5 MCP tools** (`fleet_mission_submit`, `fleet_status`, `fleet_collect`,
  `fleet_cancel`, `fleet_roster`) exposed over **Streamable HTTP** with
  stateful sessions, using the official TypeScript SDK.
- **A real fleet engine**: role-specialized workers (4 fetchers, 3 analysts,
  1 composer) run each mission as a parallel pipeline — fetch sources, analyze
  documents with local NLP (TF sentence ranking, keyword extraction, weighted
  toward the brief's subject terms so different briefs yield different
  reports), compose one report. Missions: `briefing` (research synthesis) and
  `audit` (source health). Zero paid APIs, zero API keys; runs entirely on
  your machine.
- **Live progress**: every fleet state change streams to the client as an MCP
  `notifications/message` logging notification on the session's SSE stream.
- **Alexa+ web simulator** (sanctioned by the track for builders without
  device access): a browser page that is itself a real MCP client — the
  official SDK client over Streamable HTTP — with an Alexa-style conversation
  pane, voice in/out (Web Speech API), and a live fleet dashboard. The
  interface ships one design system in two modes — **Ops** (default: dark,
  amber operations console) and **Press** (`?theme=press`: the light,
  paper-and-ink half of the same pair). Both modes are WCAG-contrast
  audited; the video uses the default (Ops).
- **Agent Skill** (`skills/fleet-operator/`): standards-compliant
  `SKILL.md` packaging that teaches any Agent-Skills-compatible agent how to
  operate the fleet, with voice-shaped response guidance.

## Quickstart

```bash
# Requires Node.js >= 20 (no API keys, no network needed)
npm install
npm run build
npm start          # MCP endpoint at http://127.0.0.1:3000/mcp, simulator at http://127.0.0.1:3000/
```

Then, in a second terminal:

```bash
npm run demo       # CLI client: full mission lifecycle over Streamable HTTP
```

Or open **http://127.0.0.1:3000/** and say "brief me on the AI news corpus".
Append `?autodemo=1` to run one mission automatically (used in the demo
video). The simulator works fully offline via a bundled corpus; pass real
http(s) URLs as sources for live-network missions.

Official-tool check: `npx @modelcontextprotocol/inspector --cli http://127.0.0.1:3000/mcp --method tools/list`

## Repository layout

| Path | What |
| --- | --- |
| `src/index.ts` | HTTP server: MCP Streamable HTTP at `/mcp` (stateful sessions) + static simulator |
| `src/mcp-server.ts` | Tool registrations + fleet-event → MCP notification bridge |
| `src/fleet/` | Fleet engine: manager, types, workers (`fetch`, `analyze`, `compose`), NLP, offline corpus |
| `src/intents/router.ts` | Deterministic intent router standing in for the Alexa+ model in the simulator |
| `public-src/simulator.ts`, `public/` | The simulated Alexa+ experience (real SDK MCP client in the browser) |
| `skills/fleet-operator/` | Agent Skill (SKILL.md + operating guide reference) |
| `scripts/demo-client.ts` | CLI proof client |
| `test/` | Unit + end-to-end tests (19) |
| `proof/` | Run artifacts: demo transcript, inspector output, live-URL audit, browser screenshot |
| `demo/DEMO-SCRIPT.md` | Demo video script (~2:20, under the 2:30 cap; includes the cancel beat) |
| `docs/FRICTION-LOG.md` | Product feedback on every tool used (track asks for this; up to 10% judging bonus) |
| `SUBMISSION.md` | Paste-ready submission fields + the steps that need the operator |

## Optional: local-model intent routing

Set `FLEETLINE_INTENT_URL` to an OpenAI-compatible endpoint (LM Studio,
Ollama, llama.cpp server) and tool selection runs on that local model, with
the deterministic keyword router as the offline fallback — transport, tools,
fleet, and events are unchanged either way. Verified live against
Qwen3.8-27B on localhost (1.6–1.9 s warm).

## Verification

- `npm test` — 19/19 green, including an end-to-end test that boots the real
  server and drives it with the official SDK client: initialize session,
  list tools, submit mission, receive fleet events as notifications, collect
  report, close session.
- `npm audit` — 0 vulnerabilities.
- `proof/` — captured runs: CLI demo transcript, official MCP Inspector
  tools/list + tools/call, an audit mission against two live URLs, and a
  headless-Chrome screenshot of the simulator mid-mission.

## Judging criterion map

| Criterion | Where Fleetline earns it |
| --- | --- |
| **Tech Implementation** | Real MCP server on the official TS SDK with stateful Streamable HTTP sessions (spec 2025-11-25); a parallel worker-pool engine with a 3-stage task pipeline and survivable partial failure; server-initiated progress as MCP logging notifications; a browser MCP client built from the same SDK; an optional local-model intent lane; 19 tests including a full end-to-end lifecycle; official MCP Inspector validation (`proof/`). |
| **Design** | The simulator is a purpose-built voice-console: Alexa-style conversation pane with visible tool calls (honesty about what the assistant does), live fleet dashboard (roster, missions, event ticker) fed by the same notifications, one-glance quick-start chips, voice in/out. Voice-shaped replies (short, numbers-first) are codified in the Agent Skill. |
| **Potential Impact** | One user, one workflow: the solo operator or developer running a local agent fleet who needs hands-free dispatch-and-collect — say "brief me on the AI news corpus" from across the room, come back to one finished report; keyboard-free and eyes-free, which is also the accessibility case (hands occupied, motor or visual constraints). Modeled on a real solo-operator workflow, not an enterprise category list. Beyond the hackathon, the audience is every developer already running local agents who wants voice as a second control surface — MCP is the portability layer, so Alexa+ operates the fleet today and any MCP client can tomorrow: no cloud, no keys, no per-call cost. And the strongest differentiator is true here: the track's sanctioned simulation path is exempt from runtime technology-hook requirements — Fleetline ships real runtime SDK hooks anyway (the simulator is itself an official-SDK MCP client over Streamable HTTP). |
| **Quality of the Idea** | One idea carried all the way: *your fleet, by voice*. It inverts the usual "voice assistant as the agent" into "voice assistant as the fleet operator", and lands it on exactly the two standards the track names (MCP Streamable HTTP + Agent Skills), so the same fleet is operable by voice, CLI, or any MCP client. |

## Honest scope notes

- The simulator's conversation brain is a **deterministic intent router**, not
  a large model — Alexa+ provides that model in production; the router stands
  in for it and is labeled as such in the UI. Everything else in the path
  (client, transport, tools, fleet, events) is real.
- Workers run real but bounded work (HTTP fetch with timeout/size caps, local
  NLP, template composition). No LLM calls, no keys, no cloud, no cost.
- Single-process, localhost-only, in-memory state. It is a demo-grade fleet,
  not a distributed orchestrator.

## License

MIT — see [LICENSE](LICENSE).
