/**
 * Remote MCP over HTTP
 *
 * `ALL /api/mcp`
 *
 * Exposes the registry tools over Streamable HTTP, authenticated by a personal
 * API key (`Authorization: Bearer abk_…`). Point Cursor (or any MCP client) here
 * to act on that key's tenant. Stateless: a fresh server + transport per request.
 *
 * @param c - Request context (API-key auth, not session)
 * @returns MCP protocol response
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { AppContext } from "@/context";
import { resolveApiKey } from "@/domains/auth/service";
import { HttpError } from "@/lib/errors";
import { createMcpServer } from "../mcp-server";

function bearerToken(c: AppContext): string | null {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export async function mcp(c: AppContext): Promise<Response> {
  // -- Input -----------------------------------------------------------------
  const key = bearerToken(c);
  if (!key) throw new HttpError(401, "Missing API key");

  // -- Processing ------------------------------------------------------------
  const principal = await resolveApiKey(key);
  if (!principal) throw new HttpError(401, "Invalid API key");

  const server = createMcpServer({
    tenantId: principal.tenantId,
    tenantName: principal.tenantName,
    tenantSlug: principal.tenantSlug,
    userId: principal.userId,
    userName: principal.userName,
    role: principal.role,
  });

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(c.req.raw);
  c.req.raw.signal.addEventListener("abort", () => void server.close());

  // -- Output ----------------------------------------------------------------
  return response;
}
