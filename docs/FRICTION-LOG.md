# Friction log — tools used building Fleetline

Honest notes, written during the build (2026-09-21). The track asks for
feedback on every tool/API/SDK used; friction logs can earn a judging bonus,
but these are logged because they are true.

## @modelcontextprotocol/sdk 1.30.0 (TypeScript)

**What we used:** server (`McpServer`, `registerTool`,
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

**Friction (in the order it cost us):**
1. **Sending logging notifications requires a capability that is easy to
   forget and fails silently.** We bridged fleet events to
   `notifications/message`; the SDK rejected every send with "Server does
   not support logging (required for notifications/message)" — but only at
   runtime, and our `.catch()` swallowed it, so notifications just never
   arrived. Fix was one line (`capabilities: { logging: {} }` on the server
   options), but discovering it took a debugging cycle with a raw-socket
   probe. Suggestion: fail loud on the server side, or document the logging
   capability requirement on `sendLoggingMessage`/notification paths more
   prominently.
2. **`onclose` is a callback property, `onClose` does not exist** — an easy
   trap given `sendNotification` → `notification()` renames in the same
   release line. TypeScript catches it, but the naming asymmetry reads like
   an API that grew. A method-style `onClose(handler)` with multi-listener
   support would be less surprising.
3. **Stateful Streamable HTTP needs one McpServer per session** sharing your
   own state singletons. This is documented in examples but not in the types:
   nothing in `server.connect(transport)` warns you that connecting twice is
   unsupported. A `StatefulStreamableHttp` helper that owns session→server
   wiring would remove the most common footgun in this pattern.

## MCP Inspector (CLI mode)

- `--version` is not a recognized flag — it launched the web UI instead.
  Harmless, but unexpected for a CLI-first audience.
- `--cli node dist/src/index.js` spawns the server with a sanitized
  environment; our `PORT=...` env var did not reach the child, and the
  server died on EADDRINUSE against our already-running instance. The
  `--env KEY:VALUE` form also did not appear to apply. Pointing the
  inspector at a URL target (`--cli http://127.0.0.1:3000/mcp`) worked
  immediately and is the mode we recommend for HTTP-transport servers.

## Agent Skills spec (agentskills.io)

- The spec is pleasantly small and the frontmatter constraints are spelled
  out (name must match the directory, no consecutive hyphens, description
  length budgets) — our `SKILL.md` validated by eye without issues.
- The reference validator (`skills-ref`) is a separate library; a zero-install
  validator (or a schema published to SchemaStore so editors lint
  frontmatter natively) would lower friction for first-time skill authors.

## Hackathon surface (devpost / resources)

- The Alexa+ track requirement ("working MCP integration on the open
  standards for Agent Skills and Streamable HTTP transports") plus the
  simulated-experience allowance are accurate and liberating — thank you for
  explicitly blessing the web-app simulation path for builders without
  device access.
- The required spec version (2025-11-25) currently lives only in a URL
  fragment on the resources page; surfacing it as text (and whether older
  revisions are accepted) would remove a round of guessing.

## Node.js 26 / esbuild 0.28 / zod 3

- `node --test <dir>` no longer accepts a bare directory in the way older
  guides suggest; globs (`node --test dist/test/*.test.js`) work. Tooling
  friction, not the SDK's.
- esbuild 0.28 bundling the SDK client for the browser: no issues, fast, and
  `npm audit` is clean at `^0.28.0` (0.24.x carried a moderate advisory).
