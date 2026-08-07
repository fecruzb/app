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
import { acceptInvite } from "./invite.accept.post.public.route";
import { getInvite } from "./invite.get.public.route";
import { getTenant } from "./tenant.get.route";
import { revokeInvite } from "./tenant.invites.invite.delete.route";
import { listInvites } from "./tenant.invites.get.route";
import { createInvite } from "./tenant.invites.post.route";
import { removeMember } from "./tenant.members.member.delete.route";
import { listMembers } from "./tenant.members.get.route";
import { updateMemberRole } from "./tenant.members.member.patch.route";
import { updateTenant } from "./tenant.patch.route";

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
