// Remote MCP endpoint: exposes the same tools over HTTP (Streamable HTTP),
// authenticated by a personal API key. Point Cursor (or any MCP client) at
// POST /api/mcp with `Authorization: Bearer abk_...` to act on that key's tenant.
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { AppContext } from "@/context";
import { resolveApiKey } from "@/domains/auth/service";
import { createMcpServer } from "./mcp-server";

function bearerToken(c: AppContext): string | null {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function mcpHttp(c: AppContext): Promise<Response> {
  const key = bearerToken(c);
  if (!key) {
    return c.json({ error: "Missing API key" }, 401);
  }

  const principal = await resolveApiKey(key);
  if (!principal) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  // Stateless: a fresh server + transport per request, scoped to the key's tenant.
  const server = createMcpServer({
    tenantId: principal.tenantId,
    tenantName: principal.tenantName,
    tenantSlug: principal.tenantSlug,
    userId: principal.userId,
    userName: principal.userName,
    role: "owner",
  });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(c.req.raw);
  c.req.raw.signal.addEventListener("abort", () => void server.close());
  return response;
}
