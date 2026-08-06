/**
 * Agent tool contract
 *
 * Transport-neutral definition helpers for agent tools. Each domain defines
 * tools in `domains/<domain>/tools/*` (one per file); the registry joins them.
 * Tools return JSON-serializable data and throw `Error` for expected failures —
 * `mcp-server` (MCP) and the assistant (OpenAI loop) adapt at the edges. A
 * tool with `summarize` is a write action (chip in the chat UI); without it, a
 * read.
 */
import type { z, ZodRawShape } from "zod";
import type { TenantRole } from "@app/shared";

/**
 * Agent context
 *
 * Tenant and actor identity passed into every tool execution.
 */
export type AgentContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  /** Null when running via stdio without a user (e.g. Cursor in dev). */
  userId: string | null;
  userName: string;
  role: TenantRole;
};

/**
 * Agent tool
 *
 * Runtime shape registered for MCP and the in-app assistant.
 */
export type AgentTool = {
  name: string;
  description: string;
  inputSchema: ZodRawShape;
  /** Action label for the UI; only present on write tools. */
  summarize?: (args: Record<string, unknown>) => string;
  /** Returns JSON-serializable data; throw Error for expected failures. */
  execute: (ctx: AgentContext, args: Record<string, unknown>) => Promise<unknown>;
};

/**
 * Define a tool
 *
 * Helper that types `args` from the Zod `inputSchema`.
 */
export function defineTool<Shape extends ZodRawShape>(tool: {
  name: string;
  description: string;
  inputSchema: Shape;
  summarize?: (args: z.output<z.ZodObject<Shape>>) => string;
  execute: (ctx: AgentContext, args: z.output<z.ZodObject<Shape>>) => Promise<unknown>;
}): AgentTool {
  return tool as unknown as AgentTool;
}
