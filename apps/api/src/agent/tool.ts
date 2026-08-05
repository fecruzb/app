// Contrato das tools do agente. Cada domínio define as suas em
// domains/<dominio>/tools/*, uma por arquivo, e o registry (registry.ts)
// junta tudo. O contrato é neutro de transporte: a tool retorna dados
// JSON-serializáveis e lança Error para falhas esperadas — quem adapta para
// MCP (mcp-server) ou para o loop da OpenAI (assistant) são as bordas.
// A tool se auto-descreve: se tiver `summarize`, é uma ação de escrita e
// vira chip na UI do chat; sem `summarize`, é leitura.
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
  /** Retorna dados JSON-serializáveis; lance Error para falha esperada. */
  execute: (ctx: AgentContext, args: Record<string, unknown>) => Promise<unknown>;
};

/** Helper de definição com args tipados a partir do inputSchema. */
export function defineTool<Shape extends ZodRawShape>(tool: {
  name: string;
  description: string;
  inputSchema: Shape;
  summarize?: (args: z.output<z.ZodObject<Shape>>) => string;
  execute: (ctx: AgentContext, args: z.output<z.ZodObject<Shape>>) => Promise<unknown>;
}): AgentTool {
  return tool as unknown as AgentTool;
}
