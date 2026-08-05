// MCP adapter: exposes the registry tools over the MCP protocol, bound to a
// context (tenant + user). The only place that knows the MCP format.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { allTools } from "./registry";
import type { AgentContext } from "./tool";

export function createMcpServer(ctx: AgentContext): McpServer {
  const server = new McpServer({ name: "app-base", version: "1.0.0" });
  for (const tool of allTools) {
    server.registerTool(
      tool.name,
      { description: tool.description, inputSchema: tool.inputSchema },
      async (args): Promise<CallToolResult> => {
        try {
          const data = await tool.execute(ctx, args as Record<string, unknown>);
          return { content: [{ type: "text", text: JSON.stringify(data ?? null) }] };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { content: [{ type: "text", text: message }], isError: true };
        }
      },
    );
  }
  return server;
}
