import { registerSchema } from "@app/shared";
import { env } from "@/lib/env";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { createTenantWithOwner } from "@/domains/tenant/service";
import {
  buildMe,
  createSession,
  hashPassword,
  meWithShellToken,
  sendVerificationEmail,
  setSessionCookie,
} from "../service";
import { authRepository } from "../repository";

/**
 * Register an account
 *
 * `POST /api/auth/register`
 *
 * Creates a user, a personal owner tenant, sends a verification email, and
 * starts a session. Rejected when self-signup is disabled.
 *
 * @param c - Public request context
 * @returns 201 with the me payload and session cookie set
 */
export async function register(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  if (!env.selfSignupEnabled) {
    throw new HttpError(403, "Sign-up is disabled — ask an administrator for an invite");
  }
  const data = await parseBody(c, registerSchema);

  // -- Processing ------------------------------------------------------------
  if (await authRepository.findUserByEmail(data.email)) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const user = await authRepository.insertUser({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
  });

  const firstName = data.name.split(" ")[0];
  await createTenantWithOwner(`${firstName}'s Workspace`, user.id);

  await sendVerificationEmail(user);
  const sessionToken = await createSession(user.id);

  // -- Output ----------------------------------------------------------------
  setSessionCookie(c, sessionToken);
  return c.json(meWithShellToken(c, await buildMe(user), sessionToken), 201);
}
