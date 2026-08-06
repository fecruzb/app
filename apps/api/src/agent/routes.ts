/**
 * Agent routes
 *
 * In-app assistant chat and voice transcription, scoped to a tenant.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { chat } from "./endpoints/chat.endpoint";
import { transcribe } from "./endpoints/transcribe.endpoint";

/**
 * Agent route group
 *
 * Mounted at `/api/tenants/:tenantId/agent`.
 */
export const agentRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .post("/", chat)
  .post("/transcribe", transcribe);
