// Mapa de rotas do domínio tenant — cada handler vive em endpoints/*.
import { Hono } from "hono";
import type { AppEnv } from "@/lib/http";
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

// Tudo aqui exige sessão + membership no tenant do path — aplicado uma vez,
// então toda rota nova nasce isolada por tenant. `requireManager` (owner/admin)
// entra por rota onde há gestão.
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

/** Rotas públicas de convite (o token é a credencial). */
export const inviteRoutes = new Hono<AppEnv>()
  .get("/:token", getInvite)
  .post("/:token/accept", acceptInvite);
