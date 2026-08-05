// Auth business rules: opaque sessions in an httpOnly cookie and action
// tokens sent by email. Crypto primitives live in lib/crypto.
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { generateToken, hashToken } from "@/lib/crypto";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { verifyEmailTemplate } from "./emails";
import { authRepository } from "./repository";
import type { ActionTokenPurpose, User } from "./schema";

export { hashPassword, verifyPassword } from "@/lib/crypto";

export const SESSION_COOKIE = "app_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const TOKEN_TTL: Record<ActionTokenPurpose, number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};

// -- sessions -----------------------------------------------------------------

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  await authRepository.insertSession({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  return authRepository.findSessionUser(hashToken(token));
}

export async function deleteSession(token: string): Promise<void> {
  await authRepository.deleteSessionByTokenHash(hashToken(token));
}

export async function deleteUserSessions(userId: string, exceptToken?: string): Promise<void> {
  await authRepository.deleteUserSessions(userId, exceptToken ? hashToken(exceptToken) : undefined);
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: env.isProduction,
    maxAge: SESSION_TTL_MS / 1000,
  });
}

// -- action tokens (email verification / password reset) -----------------------

export async function createActionToken(
  userId: string,
  purpose: ActionTokenPurpose,
): Promise<string> {
  const token = generateToken();
  await authRepository.replaceActionToken({
    userId,
    purpose,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL[purpose]),
  });
  return token;
}

export async function consumeActionToken(
  token: string,
  purpose: ActionTokenPurpose,
): Promise<string | null> {
  return authRepository.consumeActionToken(hashToken(token), purpose);
}

export async function sendVerificationEmail(user: User): Promise<void> {
  const token = await createActionToken(user.id, "verify_email");
  const { subject, html } = verifyEmailTemplate(user.name, `${env.appUrl}/verify-email/${token}`);
  void sendEmail({ to: user.email, subject, html });
}
