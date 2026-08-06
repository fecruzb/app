// Usage of the signed-in user — tenant-independent, like the account routes.
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { getAiUsage } from "./endpoints/get-ai-usage.endpoint";

export const usageRoutes = new Hono<AppEnv>().use("*", requireAuth).get("/ai", getAiUsage);
