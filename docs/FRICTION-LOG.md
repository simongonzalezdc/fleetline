# Friction log — tools used building Fleetline

Honest notes, written during the build (2026-09-21). The track asks for
feedback on every tool/API/SDK used; friction logs can earn a judging bonus
(Stage-1 assessed, discretionary, up to 10%), but these are logged because
they are true. Every friction entry below follows the prescribed shape:
**task attempted / steps taken / expected vs actual / severity / workaround /
actionable suggestion**. Severity scale: **blocker** = stopped the build;
**major** = cost a debugging cycle or a redesign; **minor** = papercut.

## @modelcontextprotocol/sdk 1.30.0 (TypeScript)

**Used for:** server (`McpServer`, `registerTool`,
`StreamableHTTPServerTransport`, stateful sessions), and the browser client
(`Client` + `StreamableHTTPClientTransport`, bundled with esbuild).

**Worked well:**
- The high-level `registerTool` with zod-raw-shape schemas is clean, and the
  deprecation path from `server.tool()` is clearly marked.
- The browser client bundles without shims — the streamable-HTTP client path
  has no node builtins, so esbuild produced a working browser bundle first
  try. Genuinely good isomorphism.
- Raw-protocol interop matched the spec: our curl-level probes (initialize →
  202 on `notifications/initialized` → GET SSE 200 `text/event-stream`)
  behaved exactly as the 2025-11-25 transport spec describes.

### Entry F1 — Logging capability is easy to forget and fails silently

| Field | Notes |
| --- | --- |
| Task attempted | Bridge every fleet state change to MCP `notifications/message` so clients see live progress over the session's SSE stream. |
| Steps taken | Wired the fleet-event → logging-notification bridge per session; added `.catch()` on the sends; ran server and client end to end expecting events. |
| Expected vs actual | Expected: events arrive on the SSE stream. Actual: the SDK rejected every send with "Server does not support logging (required for notifications/message)" — but only at runtime, and our `.catch()` swallowed it, so notifications silently never arrived. |
| Severity | major — a working feature died quietly; discovery took a debugging cycle with a raw-socket probe. |
| Workaround | One line: `capabilities: { logging: {} }` on the server options. |
| Actionable suggestion | Fail loud on the server side, or document the logging-capability requirement on `sendLoggingMessage`/notification paths more prominently. |

### Entry F2 — `onclose` is a callback property; `onClose` does not exist

| Field | Notes |
| --- | --- |
| Task attempted | Wire session-close handling on the transport. |
| Steps taken | Reached for `onClose`, following the same release line's `sendNotification` → `notification()` renames. |
| Expected vs actual | Expected: an `onClose` handler. Actual: the property is `onclose`, a single callback; `onClose` does not exist. TypeScript catches it, but the naming asymmetry reads like an API that grew. |
| Severity | minor |
| Workaround | Use `onclose`; trust the type checker. |
| Actionable suggestion | A method-style `onClose(handler)` with multi-listener support would be less surprising. |

### Entry F3 — Stateful Streamable HTTP needs one `McpServer` per session, and the types don't warn you

| Field | Notes |
| --- | --- |
| Task attempted | Stand up stateful Streamable HTTP sessions behind one HTTP server. |
| Steps taken | Built session → transport → server wiring with shared state singletons, after reading the SDK examples. |
| Expected vs actual | Expected: `server.connect(transport)` types or docs to flag that connecting one server twice is unsupported. Actual: nothing in the types warns; the constraint is documented only in examples. |
| Severity | major — the most common footgun in this pattern. |
| Workaround | Own the session→server wiring yourself (one `McpServer` per transport, state in shared singletons), as the examples show. |
| Actionable suggestion | Ship a `StatefulStreamableHttp` helper that owns session→server wiring. |

## MCP Inspector (CLI mode)

**Used for:** validating the tool surface (`tools/list`, `tools/call`).
**Worked well:** pointing the inspector at a URL target worked immediately —
see F5's workaround for the mode we recommend.

### Entry F4 — `--version` is not a recognized flag

| Field | Notes |
| --- | --- |
| Task attempted | Print the inspector version from the CLI. |
| Steps taken | Ran `--version`. |
| Expected vs actual | Expected: a version string. Actual: it launched the web UI instead. Harmless, but unexpected for a CLI-first audience. |
| Severity | minor |
| Workaround | Read the version from the npm package instead. |
| Actionable suggestion | Recognize `--version` in CLI mode. |

### Entry F5 — Command mode spawns the server with a sanitized environment

| Field | Notes |
| --- | --- |
| Task attempted | Inspect our HTTP server through the inspector's command mode (`--cli node dist/src/index.js`). |
| Steps taken | Ran command mode with `PORT=...` set in the environment; retried with `--env KEY:VALUE`; finally pointed the inspector at the already-running server URL. |
| Expected vs actual | Expected: environment passthrough, and `--env` to apply. Actual: `PORT` did not reach the child and the server died on EADDRINUSE against our already-running instance; `--env` also did not appear to apply. URL-target mode (`--cli http://127.0.0.1:3000/mcp`) worked immediately. |
| Severity | major for command-mode workflows — fully worked around. |
| Workaround | Point the inspector at a URL target; that is the mode we recommend for HTTP-transport servers. |
| Actionable suggestion | Honor `--env KEY:VALUE` (or document the sanitization) in command mode. |

## Agent Skills spec (agentskills.io)

**Worked well:** the spec is pleasantly small and the frontmatter constraints
are spelled out (name must match the directory, no consecutive hyphens,
description length budgets) — our `SKILL.md` validated by eye without issues.

### Entry F6 — The reference validator is a separate library

| Field | Notes |
| --- | --- |
| Task attempted | Validate `SKILL.md` frontmatter mechanically. |
| Steps taken | Read the spec constraints; looked for an editor-native way to lint them. |
| Expected vs actual | Expected: a zero-install way to lint frontmatter. Actual: the reference validator (`skills-ref`) is a separate library; nothing editor-native. |
| Severity | minor |
| Workaround | By-eye validation against the stated constraints. |
| Actionable suggestion | Publish a schema to SchemaStore (or a zero-install validator) so editors lint frontmatter natively — it would lower friction for first-time skill authors. |

## Hackathon surface (devpost / resources)

**Worked well:** the Alexa+ track requirement ("working MCP integration on
the open standards for Agent Skills and Streamable HTTP transports") plus the
simulated-experience allowance are accurate and liberating — thank you for
explicitly blessing the web-app simulation path for builders without device
access.

### Entry F7 — The required spec version lives only in a URL fragment

| Field | Notes |
| --- | --- |
| Task attempted | Pin the exact transport spec revision to implement against. |
| Steps taken | Hunted the resources page for the required version. |
| Expected vs actual | Expected: the required spec version surfaced as text (and whether older revisions are accepted). Actual: the 2025-11-25 revision lives only in a URL fragment. |
| Severity | minor |
| Workaround | Implement to the 2025-11-25 revision, read out of the URL fragment. |
| Actionable suggestion | Surface the required revision as text, and state whether older revisions are accepted. |

## Node.js 26 / esbuild 0.28 / zod 3

**Worked well:** esbuild 0.28 bundling the SDK client for the browser — no
issues, fast, and `npm audit` clean at `^0.28.0` (0.24.x carried a moderate
advisory).

### Entry F8 — `node --test <dir>` no longer accepts a bare directory

| Field | Notes |
| --- | --- |
| Task attempted | Run the test suite on Node 26. |
| Steps taken | Ran the bare-directory form older guides suggest; switched to globs. |
| Expected vs actual | Expected: `node --test <dir>` discovers the tests. Actual: it no longer accepts a bare directory; globs (`node --test dist/test/*.test.js`) work. |
| Severity | minor — tooling friction, not the SDK's. |
| Workaround | Use globs. |
| Actionable suggestion | Update the test-runner guides for the Node 26 CLI. |
