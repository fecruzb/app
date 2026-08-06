/**
 * Tenant routes
 *
 * Wires handlers into the Hono route groups. Auth + membership are applied once
 * on the path tenant so every new route is isolated by default. Individual
 * handlers live in `*.route.ts` beside this file.
 */
import { Hono } from "hono";
import type { AppEnv } from "@/context";
import { requireAuth } from "@/domains/auth/middleware";
import { requireManager, requireTenant } from "../middleware";
import { acceptInvite } from "./accept-invite.route";
import { createInvite } from "./create-invite.route";
import { getInvite } from "./get-invite.route";
import { getTenant } from "./get-tenant.route";
import { listInvites } from "./list-invites.route";
import { listMembers } from "./list-members.route";
import { removeMember } from "./remove-member.route";
import { revokeInvite } from "./revoke-invite.route";
import { updateMemberRole } from "./update-member-role.route";
import { updateTenant } from "./update-tenant.route";

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
