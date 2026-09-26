# Upstream docs PR — MCP TypeScript SDK logging-capability footgun

Date: 2026-09-25. Runner: Upstream Docs PR Runner (babysit-free, CEO-authorized).

## PR

- URL: https://github.com/modelcontextprotocol/typescript-sdk/pull/2876
- Title: `docs: clarify a missing logging capability fails per message, not at construction`
- State at submission: OPEN
- Base: `modelcontextprotocol/typescript-sdk@main` ← head `simongonzalezdc:docs/logging-capability-wiring` (fork workflow; no direct push rights, `gh` account `simongonzalezdc`)
- Size: +9/−1, exactly one file — docs-only, zero SDK code changes.

## Source of the footgun

`FRICTION-LOG.md` entry 1 (SDK 1.30.0): sending `notifications/message` without
the `logging` server capability fails only at send time ("Server does not
support logging (required for notifications/message)"); a swallowed `.catch()`
made log notifications silently never arrive. Fix: `capabilities: { logging: {} }`.

Note: the mandate's shorthand framed the footgun as "declaring logging does not
deliver"; the friction log's verified symptom is the inverse (omitting the
capability → silent per-send failure). Per the no-fabrication rule, the PR
documents the log's version, re-verified against current `main` source:

- `packages/server/src/server/server.ts` — `ctx.mcpReq.log` helper returns a
  resolved promise without sending when `_capabilities.logging` is absent
  (~line 384); `sendLoggingMessage` guard silently no-ops (~line 1294);
  `assertNotificationCapability` throws `SdkError: Server does not support
  logging (required for notifications/message)` for `notifications/message`
  (~line 787).
- `packages/core-internal/src/shared/protocol.ts` ~line 1619 — the assertion
  runs inside the notification send path, i.e. per message, never at
  construction/connect time.

## Diff summary

`docs/servers/logging-progress-cancellation.md` (the guide's dedicated logging
page; repo README has no logging section — docs/ is the canonical home):

1. After the existing "Declare the `logging` capability" snippet: a short
   paragraph + plain error block stating that nothing fails at construction
   time; `ctx.mcpReq.log`/`sendLoggingMessage` resolve without sending, a raw
   `notifications/message` notification rejects at send time; a swallowed
   fire-and-forget rejection leaves no trace; check for
   `capabilities: { logging: {} }` first when log notifications never arrive.
2. Recap bullet extended with the failure mode (silent drop from high-level
   helpers, send-time rejection from raw notification).

Style matched to the page (prose + fenced output block, existing callouts and
terminology preserved). No `source=` example snippets added, so no example
files or tests touched.

## STOP-check result

Not already documented: the page mentioned the capability requirement (one
line: "Declare the `logging` capability when you construct the server") but the
silent-failure mode was documented nowhere, and `sendLoggingMessage` TSDoc
omits the requirement entirely. Proceeded per mandate.

## Contribution-process compliance

CONTRIBUTING.md requires issue-first for features/significant changes;
straightforward small fixes may skip it. Docs-only, one page, +9/−1 → skipped
issue per that carve-out. PR targets `main` (v2 stable line, where the docs
tree lives; the v1 hit is noted neutrally in the PR body as "SDK 1.30.0"). No
CLA/DCO found in CONTRIBUTING.md.

## Verification (post-submit)

`gh pr view 2876 -R modelcontextprotocol/typescript-sdk` →

```json
{"additions":9,"base":"main","deletions":1,
 "files":["docs/servers/logging-progress-cancellation.md"],
 "head":"docs/logging-capability-wiring","number":2876,"state":"OPEN",
 "title":"docs: clarify a missing logging capability fails per message, not at construction",
 "url":"https://github.com/modelcontextprotocol/typescript-sdk/pull/2876"}
```

`gh pr diff 2876` confirmed the live diff matches the committed one exactly
(single file, the paragraph + error block + recap bullet). PR body: problem,
symptom, what changed — neutral, no org names/paths, no contest mention.

## Pending / not done by design

- Merge is upstream's call; nothing to chase beyond normal review cadence.
- TSDoc on `sendLoggingMessage` (`packages/server/src/server/mcp.ts` +
  `server.ts`) also lacks the capability note; intentionally left out to keep
  the PR unambiguously docs-only (the mandate allowed TSDoc only as fallback
  home; docs/ is the primary home and was used).

Status: DONE — PR #2876 open, verified docs-only, receipt written.
