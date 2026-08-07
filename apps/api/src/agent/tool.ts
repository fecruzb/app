/**
 * Agent tool contract
 *
 * Transport-neutral definition helpers for agent tools. Each domain defines
 * tools in `domains/<domain>/tools/*` (one per file); the registry joins them.
 * Tools return JSON-serializable data and throw `ToolError` for expected
 * failures whose message is safe to show the caller — `mcp-server` (MCP) and
 * the assistant (OpenAI loop) surface those verbatim and mask any other error
 * behind a generic message. A tool with `summarize` is a write action (chip in
 * the chat UI); without it, a read. Optional `progress` is the in-flight label
 * while the tool runs.
 */
import type { z, ZodRawShape } from "zod";
import type { TenantRole } from "@app/shared";

/**
 * Tool error
 *
 * Expected, caller-safe failure from a tool (e.g. "Task not found"). The edges
 * surface its message; any other thrown error is masked as a generic failure so
 * driver/SQL/internal details never reach an MCP client or the chat UI.
 */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

/**
 * Agent context
 *
 * Tenant and actor identity passed into every tool execution.
 */
export type AgentContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  /** Acting user (from session chat or API-key MCP). */
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
  /** In-flight label while the tool runs (chat chip / FAB). */
  progress?: (args: Record<string, unknown>) => string;
  /** Done label for the UI; only present on write tools. */
  summarize?: (args: Record<string, unknown>) => string;
  /** Returns JSON-serializable data; throw `ToolError` for expected failures. */
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
  progress?: (args: z.output<z.ZodObject<Shape>>) => string;
  summarize?: (args: z.output<z.ZodObject<Shape>>) => string;
  execute: (ctx: AgentContext, args: z.output<z.ZodObject<Shape>>) => Promise<unknown>;
}): AgentTool {
  return tool as unknown as AgentTool;
}
