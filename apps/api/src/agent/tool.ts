// Agent tool contract. Each domain defines its tools in
// domains/<domain>/tools/* (one per file) and the registry joins them all.
// The contract is transport-neutral: tools return JSON-serializable data and
// throw Error for expected failures — mcp-server (MCP) and assistant (OpenAI
// loop) adapt at the edges. A tool with `summarize` is a write action (shown
// as a chip in the chat UI); without it, a read.
import type { z, ZodRawShape } from "zod";
import type { TenantRole } from "@app/shared";

export type AgentContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  /** null when running via stdio without a user (e.g. Cursor in dev). */
  userId: string | null;
  userName: string;
  role: TenantRole;
};

export type AgentTool = {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  /** Action label for the UI; only present on write tools. */
  summarize?: (args: Record<string, unknown>) => string;
  /** Returns JSON-serializable data; throw Error for expected failures. */
  execute: (ctx: AgentContext, args: Record<string, unknown>) => Promise<unknown>;
};

/** Definition helper with args typed from the inputSchema. */
export function defineTool<Shape extends ZodRawShape>(tool: {
  name: string;
  description: string;
  inputSchema: Shape;
  summarize?: (args: z.output<z.ZodObject<Shape>>) => string;
  execute: (ctx: AgentContext, args: z.output<z.ZodObject<Shape>>) => Promise<unknown>;
}): AgentTool {
  return tool as unknown as AgentTool;
}
