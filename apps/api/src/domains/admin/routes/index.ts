/**
 * Admin routes
 *
 * Platform admin surface — cross-tenant lists and edits. Auth + platform admin
 * middleware run once for the group. Individual handlers live in `*.route.ts`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth, requirePlatformAdmin } from "@/domains/auth/middleware";
import { listTenants } from "./list-tenants.route";
import { listUsers } from "./list-users.route";
import { updateTenant } from "./update-tenant.route";
import { updateUser } from "./update-user.route";

/**
 * Admin route group
 *
 * Mounted at `/api/admin`. Requires a session and platform admin.
 */
export const adminRoutes = new Hono<AppEnv>()
  .use("*", requireAuth, requirePlatformAdmin)
  .get("/users", listUsers)
  .patch("/users/:userId", updateUser)
  .get("/tenants", listTenants)
  .patch("/tenants/:tenantId", updateTenant);
