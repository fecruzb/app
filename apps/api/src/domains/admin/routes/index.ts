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
import { listPlatformInvites } from "./invites.get.route";
import { revokePlatformInvite } from "./invites.invite.delete.route";
import { createPlatformInvite } from "./invites.post.route";
import { acceptPlatformInvite } from "./invite.accept.post.join.route";
import { getPlatformInvite } from "./invite.get.join.route";
import { listPlans } from "./plans.get.route";
import { listTenants } from "./tenants.get.route";
import { updateTenant } from "./tenants.tenant.patch.route";
import { listUsers } from "./users.get.route";
import { updateUser } from "./users.user.patch.route";

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
