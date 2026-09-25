# Fleetline — submission package

Hackathon: Build, Ship, Shape (Amazon Developer Hackathon 2026)
Track: **Alexa+** (MCP + Agent Skills)
Deadline: Oct 23, 2026, 12:00pm PDT — https://amazonappdev2026.devpost.com

## Paste-ready fields

### Project name

Fleetline — command an agent fleet by voice (MCP + Agent Skills)

### One-line summary

A self-hosted MCP server and Agent Skill that let Alexa+ run a local agent
fleet: dispatch missions by voice, watch workers execute in parallel with live
progress, collect the finished report.

### Description (long form)

Fleetline turns a voice assistant into the operator of an agent fleet. It is
built on the two open standards the Alexa+ track names: an MCP server over
the Streamable HTTP transport (spec 2025-11-25) and a standards-compliant
Agent Skill.

The fleet engine runs role-specialized workers — four fetchers, three
analysts, one composer. A `briefing` mission fetches every source in
parallel, analyzes each document with local NLP (TF sentence ranking,
keyword extraction, reading time), and composes one report. An `audit`
mission checks source health with pass/fail verdicts. Partial failure is
survivable: a dead source degrades the report, never the mission.

Five MCP tools expose the fleet (`fleet_mission_submit`, `fleet_status`,
`fleet_collect`, `fleet_cancel`, `fleet_roster`), and every state change
streams to the client as an MCP logging notification over the session's SSE
stream — the mechanism a production assistant uses to say "still working on
it".

Because we have no Alexa+ device access, the demo uses the simulated Alexa+
experience the track sanctions: a web app at `http://127.0.0.1:3000/` that is
itself a real MCP client — the official TypeScript SDK over Streamable HTTP —
with an Alexa-style conversation pane (voice in/out via Web Speech API) and a
live fleet dashboard. A deterministic intent router stands in for the Alexa+
model's tool selection and is labeled as such in the UI; everything else in
the path is the real protocol.

Who this is for — one specific case, not a category list: the solo operator
or developer running a local agent fleet who needs hands-free
dispatch-and-collect. The workflow is one loop, modeled on a real
solo-operator workflow: say "brief me on the AI news corpus" from across the
room, watch live progress stream back, return to one collected report —
keyboard-free and eyes-free, which is the accessibility case too (hands
occupied, motor or visual constraints). Beyond the hackathon, the audience is
every developer already running local agents who wants voice as a second
control surface; MCP is the portability layer, so Alexa+ operates the fleet
today and any MCP client can tomorrow.

One differentiator worth naming: the track's sanctioned simulation path is
exempt from runtime technology-hook requirements — and Fleetline ships real
runtime SDK hooks anyway. The simulator is itself an official-SDK MCP client
speaking Streamable HTTP to the server.

Zero paid services, zero API keys, zero cloud: the fleet runs entirely
on localhost, with a bundled offline corpus so judges get a deterministic
run regardless of network. `npm test` covers 14 tests including a full
end-to-end lifecycle over Streamable HTTP; `npm audit` reports 0
vulnerabilities; the official MCP Inspector validates the server; and the
shipped `skills/fleet-operator` Agent Skill teaches any skills-compatible
agent to operate the fleet with voice-shaped responses.

### Built with

TypeScript, Node.js, `@modelcontextprotocol/sdk` (server + browser client,
Streamable HTTP), zod, esbuild, Web Speech API, node:test. Agent Skills
format per agentskills.io.

### Tools/APIs feedback (friction logs)

See `docs/FRICTION-LOG.md` — honest friction notes on the MCP TypeScript SDK
(server and browser client), the Streamable HTTP transport, and the Agent
Skills spec, written during the build. Each entry follows the track's
prescribed shape: task attempted / steps taken / expected vs actual /
severity / workaround / actionable suggestion.

### Product Feedback (Devpost) — paste-ready answers

**Which tools/APIs did you use, and for what?**
`@modelcontextprotocol/sdk` 1.30.0 — the server (`McpServer`,
`registerTool`, `StreamableHTTPServerTransport` with stateful sessions) and
the browser client (`Client` + `StreamableHTTPClientTransport`, bundled with
esbuild) that plays the simulated Alexa+. The MCP Inspector (CLI) to validate
the tool surface. The Agent Skills spec (agentskills.io) for the shipped
`SKILL.md`. Supporting stack: zod (tool schemas), esbuild 0.28 (browser
bundle), Node.js 26 test runner, Web Speech API (voice in/out).

**What worked well?**
The SDK's high-level `registerTool` with zod-raw-shape schemas is clean, with
a clearly marked deprecation path from `server.tool()`. The browser client
bundled with esbuild on the first try, no shims — genuinely good isomorphism.
Raw-protocol interop matched the 2025-11-25 spec exactly (initialize → 202 on
`notifications/initialized` → GET SSE 200 `text/event-stream`). The Agent
Skills spec is pleasantly small with frontmatter constraints spelled out; our
`SKILL.md` validated by eye. And the Alexa+ track's explicit blessing of a
simulated experience for builders without device access is accurate and
liberating.

**What needs improvement?**
The big one: sending `notifications/message` requires a logging capability
that is easy to forget and fails silently at runtime — our event bridge
quietly produced nothing until a raw-socket debugging cycle found the
one-line fix (`capabilities: { logging: {} }`). Beyond that: the
`onclose`/`onClose` naming asymmetry; stateful Streamable HTTP needing one
`McpServer` per session is documented only in examples, not in the types;
the Inspector's command mode sanitizes away our `PORT` env var and `--env`
did not appear to apply (URL-target mode works immediately); the Skills
reference validator is a separate library rather than editor-native; and the
required spec version lives only in a URL fragment on the resources page.
Full detail with severities and suggestions: `docs/FRICTION-LOG.md`.

**How was your onboarding experience with these tools?**
Mixed-to-good. The SDK docs and examples got us to a running Streamable HTTP
server quickly, and the browser client was the best onboarding moment — it
bundled and connected first try. The rough edges were the patterns the types
don't teach (one server per session; the logging capability) and one
runtime-only silent failure — the worst onboarding moment was discovering
that notifications had never been arriving.

**Would you build with these tools again?**
Yes. The SDK is the real thing — spec-matched interop, an isomorphic client,
and every friction we hit was documentation or API-ergonomics, not
architecture. We would reach for the same stack again, and the suggestions in
our friction log are the ones we wish had existed on day one.

### Repo

Public GitHub repo, MIT license (LICENSE). Verify before submitting:
README judging map, demo script, tests green on a clean clone
(`npm install && npm run check`).

### Video

Under 3 minutes, English, public on YouTube. Script: `demo/DEMO-SCRIPT.md`
(~2:20 target, hard cap 2:30). Must show the project running (simulator +
CLI proof).

## CEO-gated steps (do NOT do as agent)

1. **Devpost account + registration** — register at
   https://amazonappdev2026.devpost.com/register (free account; the only
   account this track needs — no Amazon developer account, no AWS account,
   no card, no purchase).
2. **GitHub publication** — create the public repo (suggest
   `simon/fleetline` or an org repo), push `main` from
   `~/workspaces/amazon-bss`, confirm MIT LICENSE
   present. Add topic `build-ship-shape`.
3. **Demo video** — record per `demo/DEMO-SCRIPT.md` (OBS or QuickTime,
   1440x900, one take with autodemo fallback), upload to YouTube as public,
   English, under 3:00.
4. **Submission form** on Devpost before Oct 23 12:00pm PDT: paste fields
   above, select the **Alexa+** track, link repo + video, attach friction
   logs, optionally select the **Open Source mini challenge** (this repo is a
   new MIT project created inside the hackathon window — verify eligibility
   wording at submission time).
5. Optional: AWS $150 credits form (deadline Oct 21 12pm PT, while supplies
   last) — only if wanted; not needed for this entry. Skip the AWS Builder
   mini challenge unless we add a real AWS integration.
6. If selected: winner forms (W-9 for US individuals) within 10 business
   days.

## Pre-submission checklist

- [ ] Fresh clone builds: `npm install && npm run build && npm test` — 14/14
- [ ] `npm start` + browser at `/` — connect banner says "MCP session live"
- [ ] Chip "Brief me on the AI news corpus" → report renders
- [ ] `?autodemo=1` runs unattended
- [ ] `npm run demo` transcript matches `proof/demo-run.txt` shape
- [ ] MCP Inspector sees 5 tools
- [ ] No secrets in repo (`git log -p | grep -i "key\|token\|secret"` clean)
- [ ] GitHub About section shows MIT license (repo Settings → license visibility)
- [ ] Verify Open Source mini-challenge eligibility wording at submission time (rules say "new, additional open-source project … alongside a primary track submission" — ambiguous for the primary repo)
- [ ] README criterion map, friction log, demo script, this file all present
