// Agent routes (mounted at /api/tenants/:tenantId/agent).
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { chat } from "./endpoints/chat.endpoint";
import { transcribe } from "./endpoints/transcribe.endpoint";

export const agentRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .post("/", chat)
  .post("/transcribe", transcribe);
