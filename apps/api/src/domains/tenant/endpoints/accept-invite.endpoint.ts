// Endpoint público: aceita o convite — com sessão ativa entra no tenant;
// sem conta, cria uma na hora (e-mail já verificado, pois o convite chegou
// por ele).
import { getCookie } from "hono/cookie";
import { acceptInviteNewAccountSchema } from "@app/shared";
import { hashPassword, hashToken } from "../../../lib/crypto";
import { HttpError, parseBody } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { authRepository } from "../../auth/repository";
import {
  createSession,
  getSessionUser,
  SESSION_COOKIE,
  setSessionCookie,
} from "../../auth/service";
import { tenantRepository } from "../repository";

export async function acceptInvite(c: AppContext) {
  const token = c.req.param("token") ?? "";
  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Convite inválido ou expirado");
  const { invite, tenant } = row;

  const sessionToken = getCookie(c, SESSION_COOKIE);
  const sessionUser = sessionToken ? await getSessionUser(sessionToken) : null;

  if (sessionUser) {
    if (sessionUser.email !== invite.email) {
      throw new HttpError(403, `Este convite é para ${invite.email} — saia e entre com essa conta`);
    }
    const existing = await tenantRepository.findMember(tenant.id, sessionUser.id);
    if (!existing) {
      await tenantRepository.insertMember({
        tenantId: tenant.id,
        userId: sessionUser.id,
        role: invite.role,
      });
    }
    await tenantRepository.deleteInviteById(invite.id);
    return c.json({ tenantSlug: tenant.slug });
  }

  if (await authRepository.findUserByEmail(invite.email)) {
    // Conta já existe — o frontend redireciona para o login e volta ao convite
    throw new HttpError(401, "Faça login para aceitar o convite");
  }

  const data = await parseBody(c, acceptInviteNewAccountSchema);
  const user = await authRepository.insertUser({
    name: data.name,
    email: invite.email,
    passwordHash: hashPassword(data.password),
    emailVerifiedAt: new Date(),
  });
  await tenantRepository.insertMember({ tenantId: tenant.id, userId: user.id, role: invite.role });
  await tenantRepository.deleteInviteById(invite.id);

  setSessionCookie(c, await createSession(user.id));
  return c.json({ tenantSlug: tenant.slug }, 201);
}
