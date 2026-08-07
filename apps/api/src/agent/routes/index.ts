/**
 * Agent routes
 *
 * Wires handlers into the Hono route groups for in-app assistant chat, voice
 * transcription, and the remote MCP endpoint. Individual handlers live in
 * `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { chat } from "./chat.route";
import { generateArticleCover } from "./generate-article-cover.route";
import { mcp } from "./mcp.route";
import { transcribe } from "./transcribe.route";

/**
 * Agent route group
 *
 * Mounted at `/api/tenants/:tenantId/agent`.
 */
export const agentRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .post("/", chat)
  .post("/transcribe", transcribe)
  .post("/articles/:articleId/cover", generateArticleCover);

/**
 * MCP route group
 *
 * Public API-key surface — the Bearer token is the credential. Mounted at
 * `/api/mcp`.
 */
export const mcpRoutes = new Hono<AppEnv>().all("/", mcp);
