// Rota do chat do agente (montada em /api/tenants/:tenantId/agent).
import { Hono } from "hono";
import type { AppEnv } from "@/lib/http";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { chat } from "./endpoints/chat.endpoint";

export const agentRoutes = new Hono<AppEnv>().use("*", requireAuth, requireTenant).post("/", chat);
