/**
 * Tenant routes
 *
 * Workspace settings, members, and invites. Auth + membership are applied once
 * on the path tenant so every new route is isolated by default. Handlers live
 * in `endpoints/*`.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { acceptInvite } from "./endpoints/accept-invite.endpoint";
import { createInvite } from "./endpoints/create-invite.endpoint";
import { getInvite } from "./endpoints/get-invite.endpoint";
import { getTenant } from "./endpoints/get-tenant.endpoint";
import { listInvites } from "./endpoints/list-invites.endpoint";
import { listMembers } from "./endpoints/list-members.endpoint";
import { removeMember } from "./endpoints/remove-member.endpoint";
import { revokeInvite } from "./endpoints/revoke-invite.endpoint";
import { updateMemberRole } from "./endpoints/update-member-role.endpoint";
import { updateTenant } from "./endpoints/update-tenant.endpoint";
import { requireManager, requireTenant } from "./middleware";

/**
 * Tenant route group
 *
 * Mounted at `/api/tenants`. Requires session + membership in the path tenant.
 */
export const tenantRoutes = new Hono<AppEnv>()
  .use("/:tenantId/*", requireAuth, requireTenant)
  .use("/:tenantId", requireAuth, requireTenant)
  .get("/:tenantId", getTenant)
  .patch("/:tenantId", requireManager, updateTenant)
  .get("/:tenantId/members", listMembers)
  .patch("/:tenantId/members/:userId", requireManager, updateMemberRole)
  .delete("/:tenantId/members/:userId", removeMember)
  .get("/:tenantId/invites", requireManager, listInvites)
  .post("/:tenantId/invites", requireManager, createInvite)
  .delete("/:tenantId/invites/:inviteId", requireManager, revokeInvite);

/**
 * Invite route group
 *
 * Public invite surface — the token is the credential. Mounted separately.
 */
export const inviteRoutes = new Hono<AppEnv>()
  .get("/:token", getInvite)
  .post("/:token/accept", acceptInvite);
