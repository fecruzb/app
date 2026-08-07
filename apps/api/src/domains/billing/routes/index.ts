/**
 * Billing routes
 *
 * Tenant-scoped plan and usage snapshot. Catalog assignment lives under admin.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireTenant } from "@/domains/tenant/middleware";
import { getBilling } from "./billing.get.route";

/**
 * Billing route group
 *
 * Mounted at `/api/tenants/:tenantId/billing`.
 */
export const billingRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requireTenant)
  .get("/", getBilling);
