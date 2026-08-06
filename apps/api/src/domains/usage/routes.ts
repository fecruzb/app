/**
 * Usage routes
 *
 * Signed-in user's AI spend. Tenant-independent, like account routes. Handlers
 * live in `endpoints/*`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { getAiUsage } from "./endpoints/get-ai-usage.endpoint";

/**
 * Usage route group
 *
 * Mounted at `/api/usage`. Requires a session.
 */
export const usageRoutes = new Hono<AppEnv>().use("*", requireAuth).get("/ai", getAiUsage);
