import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { IncomingMessage, ServerResponse } from "http";
import { createMcpServer } from "../src/server.js";

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ name: "clab-apply-mcp", version: "0.1.0" }));
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
