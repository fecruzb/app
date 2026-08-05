// Contrato das tools do agente/MCP. Cada domínio define as suas em
// domains/<dominio>/tools/*, uma por arquivo, e o registry (registry.ts)
// junta tudo. A tool se auto-descreve: se tiver `summarize`, é uma ação de
// escrita e vira chip na UI do chat; sem `summarize`, é leitura.
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { z, ZodRawShape } from "zod";
import type { TenantRole } from "@app/shared";

export type AgentContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  /** null quando rodando via stdio sem usuário (ex.: Cursor em dev). */
  userId: string | null;
  userName: string;
  role: TenantRole;
};

export type AgentTool = {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  /** Rótulo da ação para a UI; presente apenas em tools de escrita. */
  summarize?: (args: Record<string, unknown>) => string;
  execute: (ctx: AgentContext, args: Record<string, unknown>) => Promise<CallToolResult>;
};

/** Helper de definição com args tipados a partir do inputSchema. */
export function defineTool<Shape extends ZodRawShape>(tool: {
  name: string;
  description: string;
  inputSchema: Shape;
  summarize?: (args: z.output<z.ZodObject<Shape>>) => string;
  execute: (ctx: AgentContext, args: z.output<z.ZodObject<Shape>>) => Promise<CallToolResult>;
}): AgentTool {
  return tool as unknown as AgentTool;
}

export function toolJson(data: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(data) }] };
}

export function toolError(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}
