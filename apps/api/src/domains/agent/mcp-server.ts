// Servidor MCP genérico: registra as tools do registry amarradas a um
// contexto (tenant + usuário). Usado em memória pelo assistente do app e
// via stdio por clientes externos (Cursor, Claude etc.).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { allTools } from "./registry";
import type { AgentContext } from "./tool";

export function createMcpServer(ctx: AgentContext): McpServer {
  const server = new McpServer({ name: "app-base", version: "1.0.0" });
  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema },
      (args) => tool.execute(ctx, args as Record<string, unknown>),
    );
  }
  return server;
}
