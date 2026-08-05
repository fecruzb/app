// Public endpoint: accepts the invite — with an active session joins the
// tenant; without an account, creates one on the spot (email already verified
// since the invite arrived through it).
import { getCookie } from "hono/cookie";
import { acceptInviteNewAccountSchema } from "@app/shared";
import { hashPassword, hashToken } from "@/lib/crypto";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import {
  createSession,
  getSessionUser,
  SESSION_COOKIE,
  setSessionCookie,
} from "@/domains/auth/service";
import { tenantRepository } from "../repository";

export async function acceptInvite(c: AppContext) {
  const token = c.req.param("token") ?? "";
  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Invalid or expired invite");
  const { invite, tenant } = row;

  const sessionToken = getCookie(c, SESSION_COOKIE);
  const sessionUser = sessionToken ? await getSessionUser(sessionToken) : null;

  if (sessionUser) {
    if (sessionUser.email !== invite.email) {
      throw new HttpError(
        403,
        `This invite is for ${invite.email} — sign out and sign in with that account`,
      );
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
    // Account already exists — the frontend redirects to login and back to the invite
    throw new HttpError(401, "Sign in to accept the invite");
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
