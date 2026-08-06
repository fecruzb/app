/**
 * Admin routes
 *
 * Platform admin surface — cross-tenant lists and edits. Auth + platform admin
 * middleware run once for the group. Individual handlers live in `*.route.ts`.
 *
 * Public join routes (`joinRoutes`) are a second export mounted at `/api/join`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth, requirePlatformAdmin } from "@/domains/auth/middleware";
import { acceptPlatformInvite } from "./accept-platform-invite.route";
import { createPlatformInvite } from "./create-platform-invite.route";
import { getPlatformInvite } from "./get-platform-invite.route";
import { listPlatformInvites } from "./list-platform-invites.route";
import { listPlans } from "./list-plans.route";
import { listTenants } from "./list-tenants.route";
import { listUsers } from "./list-users.route";
import { revokePlatformInvite } from "./revoke-platform-invite.route";
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
  .patch("/tenants/:tenantId", updateTenant)
  .get("/plans", listPlans)
  .get("/invites", listPlatformInvites)
  .post("/invites", createPlatformInvite)
  .delete("/invites/:inviteId", revokePlatformInvite);

/**
 * Platform join route group
 *
 * Public signup-invite surface — the token is the credential. Mounted at `/api/join`.
 */
export const joinRoutes = new Hono<AppEnv>()
  .get("/:token", getPlatformInvite)
  .post("/:token/accept", acceptPlatformInvite);
