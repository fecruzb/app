/**
 * Agent routes
 *
 * Wires handlers into the Hono route group for in-app assistant chat and voice
 * transcription. Individual handlers live in `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { chat } from "./chat.route";
import { transcribe } from "./transcribe.route";

/**
 * Agent route group
 *
 * Mounted at `/api/tenants/:tenantId/agent`.
 */
export const agentRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .post("/", chat)
  .post("/transcribe", transcribe);
