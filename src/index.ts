/**
 * Fleetline entrypoint: one node:http server that
 *  - speaks MCP over Streamable HTTP at POST/GET/DELETE /mcp (stateful sessions)
 *  - serves the Alexa+ web simulator at / (public/)
 * Zero external services; runs entirely on localhost.
 */

import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { FleetManager } from "./fleet/manager.js";
import { createMcpServer } from "./mcp-server.js";

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "127.0.0.1";
const PUBLIC_DIR = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "public");

const manager = new FleetManager();

/** Session id -> live transport (stateful Streamable HTTP). */
const transports = new Map<string, StreamableHTTPServerTransport>();

async function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf-8");
}

async function handleMcp(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) {
  const sessionId = req.headers["mcp-session-id"];
  if (typeof sessionId !== "string") {
    switch (req.method) {
      case "POST": {
        // A POST without session id must be an initialize request: open a new session.
        let body: unknown;
        try {
          body = JSON.parse(await readBody(req));
        } catch {
          res.writeHead(400).end("invalid JSON");
          return;
        }
        const message = body as { method?: string };
        if (message.method !== "initialize") {
          res.writeHead(400).end("missing session id for non-initialize request");
          return;
        }
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          enableJsonResponse: false,
          onsessioninitialized: (newId) => {
            transports.set(newId, transport);
          },
        });
        transport.onclose = () => {
          for (const [id, t] of transports) if (t === transport) transports.delete(id);
        };
        const server = createMcpServer(manager);
        await server.connect(transport);
        await transport.handleRequest(req, res, message);
        return;
      }
      case "GET":
        res.writeHead(400).end("missing session id; open a session with POST initialize first");
        return;
      case "DELETE":
        res.writeHead(400).end("missing session id");
        return;
      default:
        res.writeHead(405).end("method not allowed");
        return;
    }
  }

  const transport = transports.get(sessionId);
  if (!transport) {
    res.writeHead(404).end("session not found or already terminated");
    return;
  }
  if (req.method === "POST") {
    let body: unknown;
    try {
      body = JSON.parse(await readBody(req));
    } catch {
      res.writeHead(400).end("invalid JSON");
      return;
    }
    await transport.handleRequest(req, res, body);
  } else {
    // GET (SSE stream for server-initiated messages) and DELETE (terminate).
    await transport.handleRequest(req, res);
  }
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

async function serveStatic(urlPath: string, res: import("node:http").ServerResponse) {
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = normalize(join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end("forbidden");
    return;
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    const data = await readFile(file);
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404).end("not found");
  }
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  try {
    if (url.pathname === "/mcp") {
      await handleMcp(req, res);
    } else if (req.method === "GET") {
      await serveStatic(url.pathname, res);
    } else {
      res.writeHead(405).end();
    }
  } catch (err) {
    console.error("[fleetline] request error:", err);
    if (!res.headersSent) res.writeHead(500).end("internal error");
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`[fleetline] MCP endpoint   http://${HOST}:${PORT}/mcp  (Streamable HTTP)`);
  console.log(`[fleetline] Alexa+ simulator http://${HOST}:${PORT}/`);
  console.log(`[fleetline] workers: ${manager.roster().length} | missions so far: 0`);
});

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    for (const t of transports.values()) void t.close();
    httpServer.close(() => process.exit(0));
  });
}
