/**
 * Usage routes
 *
 * Wires handlers into the Hono route group. Tenant-independent. Individual
 * handlers live in `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { getAiUsage } from "./get-ai-usage.route";

/**
 * Usage route group
 *
 * Mounted at `/api/usage`. Requires a session.
 */
export const usageRoutes = new Hono<AppEnv>().use("*", requireAuth).get("/ai", getAiUsage);
