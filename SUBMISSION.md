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
Skills spec, written during the build.

### Repo

Public GitHub repo, MIT license (LICENSE). Verify before submitting:
README judging map, demo script, tests green on a clean clone
(`npm install && npm run check`).

### Video

Under 3 minutes, English, public on YouTube. Script: `demo/DEMO-SCRIPT.md`
(2:00 target). Must show the project running (simulator + CLI proof).

## CEO-gated steps (do NOT do as agent)

1. **Devpost account + registration** — register at
   https://amazonappdev2026.devpost.com/register (free account; the only
   account this track needs — no Amazon developer account, no AWS account,
   no card, no purchase).
2. **GitHub publication** — create the public repo (suggest
   `simon/fleetline` or an org repo), push `main` from
   `/Users/simongonzalezdecruz/workspaces/amazon-bss`, confirm MIT LICENSE
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
- [ ] README criterion map, friction log, demo script, this file all present
