import { and, eq, gt } from "drizzle-orm";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { acceptInviteNewAccountSchema, type PublicInviteDto } from "@app/shared";
import { db } from "../db/client";
import { tenantInvites, tenants, tenantMembers, users } from "../db/schema";
import { HttpError, parseBody } from "../lib/errors";
import type { AppEnv } from "../middleware/auth";
import {
  createSession,
  getSessionUser,
  hashPassword,
  hashToken,
  SESSION_COOKIE,
} from "../services/auth";
import { setSessionCookie } from "./auth";

async function findValidInvite(token: string) {
  const [row] = await db
    .select({ invite: tenantInvites, tenant: tenants })
    .from(tenantInvites)
    .innerJoin(tenants, eq(tenants.id, tenantInvites.tenantId))
    .where(
      and(eq(tenantInvites.tokenHash, hashToken(token)), gt(tenantInvites.expiresAt, new Date())),
    );
  if (!row) throw new HttpError(404, "Convite inválido ou expirado");
  return row;
}

export const inviteRoutes = new Hono<AppEnv>();

// Dados públicos do convite, para a tela de aceite
inviteRoutes.get("/:token", async (c) => {
  const { invite, tenant } = await findValidInvite(c.req.param("token"));
  const [existingUser] = await db.select().from(users).where(eq(users.email, invite.email));

  const dto: PublicInviteDto = {
    tenantName: tenant.name,
    email: invite.email,
    role: invite.role,
    userExists: existingUser !== undefined,
  };
  return c.json(dto);
});

inviteRoutes.post("/:token/accept", async (c) => {
  const { invite, tenant } = await findValidInvite(c.req.param("token"));

  const sessionToken = getCookie(c, SESSION_COOKIE);
  const sessionUser = sessionToken ? await getSessionUser(sessionToken) : null;

  if (sessionUser) {
    if (sessionUser.email !== invite.email) {
      throw new HttpError(403, `Este convite é para ${invite.email} — saia e entre com essa conta`);
    }
    const [existing] = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.tenantId, tenant.id), eq(tenantMembers.userId, sessionUser.id)));
    if (!existing) {
      await db
        .insert(tenantMembers)
        .values({ tenantId: tenant.id, userId: sessionUser.id, role: invite.role });
    }
    await db.delete(tenantInvites).where(eq(tenantInvites.id, invite.id));
    return c.json({ tenantSlug: tenant.slug });
  }

  const [existingUser] = await db.select().from(users).where(eq(users.email, invite.email));
  if (existingUser) {
    // Conta já existe — o frontend redireciona para o login e volta ao convite
    throw new HttpError(401, "Faça login para aceitar o convite");
  }

  // Cria a conta na hora; e-mail já verificado, pois o convite chegou por ele
  const data = await parseBody(c, acceptInviteNewAccountSchema);
  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: invite.email,
      passwordHash: hashPassword(data.password),
      emailVerifiedAt: new Date(),
    })
    .returning();
  await db
    .insert(tenantMembers)
    .values({ tenantId: tenant.id, userId: user.id, role: invite.role });
  await db.delete(tenantInvites).where(eq(tenantInvites.id, invite.id));

  setSessionCookie(c, await createSession(user.id));
  return c.json({ tenantSlug: tenant.slug }, 201);
});
