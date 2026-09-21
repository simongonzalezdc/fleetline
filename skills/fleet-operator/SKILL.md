---
name: fleet-operator
description: Operate a local agent fleet through the Fleetline MCP server. Use when the user asks to dispatch work to agents, run a fleet briefing or source audit, check mission progress, collect a fleet report, list fleet workers, or cancel a mission. Triggers include "brief me on", "research these sources", "audit these URLs", "how is the mission going", "read me the report", "who is in the fleet".
license: MIT
compatibility: Requires a running Fleetline MCP server over Streamable HTTP (default http://127.0.0.1:3000/mcp). No network access required when using bundled corpus sources.
metadata:
  author: fleetline
  version: "1.0"
  track: "Amazon Build, Ship, Shape 2026 - Alexa+ / MCP"
---

# Fleet operator

You are commanding a real agent fleet through the Fleetline MCP server. The
fleet has role-specialized workers (fetchers, analysts, a composer) that run
missions in parallel and stream progress as notifications.

## When to use which tool

| User intent | Tool |
| --- | --- |
| "brief me on X", "research X", "analyze X" | `fleet_mission_submit` (kind `briefing`) |
| "audit these URLs", "are these sites up" | `fleet_mission_submit` (kind `audit`) |
| "how is it going", "status", "what is running" | `fleet_status` |
| "read me the report", "what did they find" | `fleet_collect` |
| "who is in the fleet", "is anyone busy" | `fleet_roster` |
| "cancel", "stop", "abort" | `fleet_cancel` |

## Mission lifecycle

1. Submit: `fleet_mission_submit` with a short `goal`, optional `sources`
   (http(s) URLs or `corpus:<key>` refs; omitted means the bundled corpus).
   Returns a `missionId` immediately; work runs in the background.
2. Progress arrives on the same session as `notifications/message` events
   (mission_created, task_started, task_completed, mission_completed).
3. Collect: `fleet_collect` with the `missionId`. It waits for completion by
   default, so submit-then-collect works in a single conversation turn.

## Voice-friendly response shaping (Alexa+)

Keep spoken replies to two or three sentences: mission id, what the fleet is
doing, and one instruction ("say 'read me the report' when you want it").
When reading a report, lead with the summary line and per-source highlights;
offer details rather than reading every bullet. Numbers beat adjectives:
"4 of 4 sources analyzed, 686 words, done in under a second."

## Edge cases

- A failed source does not fail the mission; the report lists it as unavailable.
- Collecting a cancelled mission returns status `cancelled` with no report.
- Sources are capped at 8 per mission; URLs must be http(s).
- If tools are missing, the Fleetline server is not connected; tell the user
  to start it (`npm start` in the fleetline repo) before retrying.

See [the operating guide](references/OPERATING-GUIDE.md) for full tool
schemas and worked examples.
