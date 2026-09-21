# Fleetline — 2-minute demo script

Setup before recording: `npm install && npm run build && npm start` in one
terminal; the simulator open at `http://127.0.0.1:3000/?autodemo=0` in Chrome
(window ~1440x900). Terminal #2 ready with `npm run demo`.

| Time | Screen | Action / narration |
| --- | --- | --- |
| 0:00–0:15 | Simulator | "This is Fleetline: a self-hosted MCP server that lets Alexa+ command a local agent fleet. The page you see is a simulated Alexa+ experience — which the track explicitly allows — but it is a real MCP client, built on the official TypeScript SDK, speaking Streamable HTTP to the server." |
| 0:15–0:35 | Simulator | Click the chip "Brief me on the AI news corpus". Narrate the tool call visible in the chat (`tools/call fleet_mission_submit`), then point right: "The fleet dashboard shows the workers the mission woke up — fetchers, analysts, one composer — and events stream in live." |
| 0:35–0:50 | Dashboard | Watch task_started/task_completed events roll. "Every event you see is an MCP notification pushed over the session's SSE stream — the same mechanism a production assistant would use to say 'still working on it'." |
| 0:50–1:05 | Simulator | Click "Read the report". The briefing appears; voice reads the first lines. "One composed report from four parallel analyses — keywords, top sentences, reading times — all computed locally, no API keys, zero cost." |
| 1:05–1:25 | Simulator | Click "Audit two live URLs" chip, then show PASS/FAIL table. "Fetchers do real network work — here auditing two live URLs; healthy sources PASS, dead ones FAIL, and the mission survives partial failure." |
| 1:25–1:45 | Terminal | Switch to terminal, run `npm run demo`. "The same server through the CLI client: initialize, list tools, submit, live events, collect. And `npm test` — fourteen tests including this full lifecycle end-to-end." |
| 1:45–2:00 | Editor (repo) | Show `skills/fleet-operator/SKILL.md` briefly. "Fleetline also ships as an Agent Skill — the second open standard the track asks for — so any skills-compatible agent learns to operate the fleet the same way. Fleetline: your fleet, by voice." |

Recording notes: keep the simulator's voice toggle on for the first reply so
the audience hears it speak; zoom the browser to ~125% for legibility; record
in one take with the autodemo fallback (`?autodemo=1`) if live typing flubs.
