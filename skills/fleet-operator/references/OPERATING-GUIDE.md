# Fleet operator reference

Full tool schemas and worked examples for the Fleetline MCP server
(Streamable HTTP at `http://127.0.0.1:3000/mcp` by default).

## Tools

### fleet_mission_submit

| Field | Type | Notes |
| --- | --- | --- |
| goal | string (min 3) | What the fleet should accomplish |
| kind | "briefing" \| "audit" | default `briefing` |
| sources | string[] (max 8, optional) | http(s) URLs or `corpus:<key>` |

Corpus keys: `ai-news`, `coffee-science`, `city-cycling`, `sleep-research`.
Omitting sources uses the whole corpus (fully offline).

Returns: `{ missionId, status, sourceCount, hint }`.

### fleet_status

| Field | Type |
| --- | --- |
| missionId | string (optional) |

With `missionId`: one mission's summary. Without: the last 20 missions.

Summary shape: `{ id, goal, kind, status, progress, createdAt, durationMs, taskStats }`.

### fleet_collect

| Field | Type | Notes |
| --- | --- | --- |
| missionId | string | from the submit result |
| wait | boolean (default true) | blocks up to 60s until finished |

Returns: `{ missionId, status, goal, durationMs, report, error }`. The
`report` is plain text, safe to read aloud or paste.

### fleet_roster

No arguments. Returns `{ workers: [{ id, role, status, tasksDone }] }`.
Roles: `fetcher` x4, `analyst` x3, `composer` x1.

### fleet_cancel

| Field | Type |
| --- | --- |
| missionId | string |

Workers finish their current task, then the mission stops.

## Notifications

Subscribe to `notifications/message` (logger `fleet`, level `info`). Payload
`data` is one of:

- `{ type: "mission_created", missionId, goal, kind, sourceCount, ts }`
- `{ type: "mission_started" | "mission_completed" | "mission_failed" | "mission_cancelled", missionId, ... }`
- `{ type: "task_started" | "task_completed" | "task_failed", missionId, taskId, workerId, role, label, ... }`

## Worked example (JSON-RPC over Streamable HTTP)

```
POST /mcp
{ "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": { "name": "fleet_mission_submit",
              "arguments": { "goal": "morning briefing", "kind": "briefing",
                             "sources": ["corpus:ai-news", "corpus:sleep-research"] } } }

-> { "result": { "content": [{ "type": "text",
      "text": "{ \"missionId\": \"m-001\", \"status\": \"running\", \"sourceCount\": 2, ... }" }] } }

POST /mcp  { "id": 2, "method": "tools/call",
             "params": { "name": "fleet_collect",
                         "arguments": { "missionId": "m-001" } } }
```

## Pipeline semantics

`briefing`: every source fetched in parallel (one fetcher each) -> every
usable document analyzed in parallel (one analyst each) -> one composer
merges analyst outputs into the report. `audit`: fetch only, then compose a
health table. A failing source degrades the report, never the mission.
