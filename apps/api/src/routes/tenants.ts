import { and, desc, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import {
  createInviteSchema,
  updateMemberSchema,
  updateTenantSchema,
  type InviteDto,
  type MemberDto,
  type TenantSummaryDto,
} from "@app/shared";
import { db } from "../db/client";
import { tenantInvites, tenantMembers, tenants, users } from "../db/schema";
import { env } from "../lib/env";
import { HttpError, parseBody, uuidParam } from "../lib/errors";
import { requireAuth, type AppEnv } from "../middleware/auth";
import { requireManager, requireTenant } from "../middleware/tenant";
import { generateToken, hashToken } from "../services/auth";
import { inviteTemplate, sendEmail } from "../services/email";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export const tenantRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Tenant
// ---------------------------------------------------------------------------
// Não existe criação manual de tenant: cada usuário nasce com o seu no
// cadastro (routes/auth.ts) e entra em outros apenas por convite.

tenantRoutes.get("/:tenantId", requireAuth, requireTenant, async (c) => {
  const tenant = c.get("tenant");
  const dto: TenantSummaryDto = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    role: c.get("membership").role,
  };
  return c.json(dto);
});

tenantRoutes.patch("/:tenantId", requireAuth, requireTenant, requireManager, async (c) => {
  const data = await parseBody(c, updateTenantSchema);
  const [tenant] = await db
    .update(tenants)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(tenants.id, c.get("tenant").id))
    .returning();
  const dto: TenantSummaryDto = {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    role: c.get("membership").role,
  };
  return c.json(dto);
});

// ---------------------------------------------------------------------------
// Membros
// ---------------------------------------------------------------------------

async function countOwners(tenantId: string): Promise<number> {
  const rows = await db
    .select()
    .from(tenantMembers)
    .where(and(eq(tenantMembers.tenantId, tenantId), eq(tenantMembers.role, "owner")));
  return rows.length;
}

tenantRoutes.get("/:tenantId/members", requireAuth, requireTenant, async (c) => {
  const rows = await db
    .select({ member: tenantMembers, user: users })
    .from(tenantMembers)
    .innerJoin(users, eq(users.id, tenantMembers.userId))
    .where(eq(tenantMembers.tenantId, c.get("tenant").id))
    .orderBy(tenantMembers.createdAt);

  const dtos: MemberDto[] = rows.map((r) => ({
    userId: r.user.id,
    name: r.user.name,
    email: r.user.email,
    role: r.member.role,
    joinedAt: r.member.createdAt.toISOString(),
  }));
  return c.json(dtos);
});

tenantRoutes.patch(
  "/:tenantId/members/:userId",
  requireAuth,
  requireTenant,
  requireManager,
  async (c) => {
    const data = await parseBody(c, updateMemberSchema);
    const tenant = c.get("tenant");
    const actor = c.get("membership");
    const targetUserId = uuidParam(c, "userId");

    const [target] = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenant.id), eq(tenantMembers.userId, targetUserId)));
    if (!target) throw new HttpError(404, "Membro não encontrado");

    // Só owners mexem em roles de owner (promover ou rebaixar)
    if ((target.role === "owner" || data.role === "owner") && actor.role !== "owner") {
      throw new HttpError(403, "Apenas owners podem alterar roles de owner");
    }
    if (target.role === "owner" && data.role !== "owner" && (await countOwners(tenant.id)) <= 1) {
      throw new HttpError(400, "O tenant precisa de pelo menos um owner");
    }

    await db
      .update(tenantMembers)
      .set({ role: data.role })
      .where(and(eq(tenantMembers.tenantId, tenant.id), eq(tenantMembers.userId, targetUserId)));
    return c.json({ ok: true });
  },
);

tenantRoutes.delete("/:tenantId/members/:userId", requireAuth, requireTenant, async (c) => {
  const tenant = c.get("tenant");
  const actor = c.get("membership");
  const targetUserId = uuidParam(c, "userId");
  const isSelf = targetUserId === c.get("user").id;

  if (!isSelf && actor.role !== "owner" && actor.role !== "admin") {
    throw new HttpError(403, "Apenas administradores podem remover membros");
  }

  const [target] = await db
    .select()
    .from(tenantMembers)
    .where(and(eq(tenantMembers.tenantId, tenant.id), eq(tenantMembers.userId, targetUserId)));
  if (!target) throw new HttpError(404, "Membro não encontrado");

  if (!isSelf && target.role === "owner" && actor.role !== "owner") {
    throw new HttpError(403, "Apenas owners podem remover um owner");
  }
  if (target.role === "owner" && (await countOwners(tenant.id)) <= 1) {
    throw new HttpError(400, "O tenant precisa de pelo menos um owner");
  }

  await db
    .delete(tenantMembers)
    .where(and(eq(tenantMembers.tenantId, tenant.id), eq(tenantMembers.userId, targetUserId)));
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Convites
// ---------------------------------------------------------------------------

tenantRoutes.get("/:tenantId/invites", requireAuth, requireTenant, requireManager, async (c) => {
  const rows = await db
    .select({ invite: tenantInvites, inviterName: users.name })
    .from(tenantInvites)
    .leftJoin(users, eq(users.id, tenantInvites.invitedBy))
    .where(
      and(eq(tenantInvites.tenantId, c.get("tenant").id), gt(tenantInvites.expiresAt, new Date())),
    )
    .orderBy(desc(tenantInvites.createdAt));

  const dtos: InviteDto[] = rows.map((r) => ({
    id: r.invite.id,
    email: r.invite.email,
    role: r.invite.role,
    invitedByName: r.inviterName,
    createdAt: r.invite.createdAt.toISOString(),
    expiresAt: r.invite.expiresAt.toISOString(),
  }));
  return c.json(dtos);
});

tenantRoutes.post("/:tenantId/invites", requireAuth, requireTenant, requireManager, async (c) => {
  const data = await parseBody(c, createInviteSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  const [alreadyMember] = await db
    .select()
    .from(tenantMembers)
    .innerJoin(users, eq(users.id, tenantMembers.userId))
    .where(and(eq(tenantMembers.tenantId, tenant.id), eq(users.email, data.email)));
  if (alreadyMember) throw new HttpError(409, "Esta pessoa já é membro do tenant");

  // Substitui convite pendente para o mesmo e-mail
  await db
    .delete(tenantInvites)
    .where(and(eq(tenantInvites.tenantId, tenant.id), eq(tenantInvites.email, data.email)));

  const token = generateToken();
  const [invite] = await db
    .insert(tenantInvites)
    .values({
      tenantId: tenant.id,
      email: data.email,
      role: data.role,
      tokenHash: hashToken(token),
      invitedBy: user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    })
    .returning();

  const { subject, html } = inviteTemplate(tenant.name, user.name, `${env.appUrl}/invite/${token}`);
  void sendEmail({ to: data.email, subject, html });

  const dto: InviteDto = {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    invitedByName: user.name,
    createdAt: invite.createdAt.toISOString(),
    expiresAt: invite.expiresAt.toISOString(),
  };
  return c.json(dto, 201);
});

tenantRoutes.delete(
  "/:tenantId/invites/:inviteId",
  requireAuth,
  requireTenant,
  requireManager,
  async (c) => {
    const inviteId = uuidParam(c, "inviteId");
    await db
      .delete(tenantInvites)
      .where(and(eq(tenantInvites.tenantId, c.get("tenant").id), eq(tenantInvites.id, inviteId)));
    return c.json({ ok: true });
  },
);
