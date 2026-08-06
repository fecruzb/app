import { resetPasswordSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import {
  buildMe,
  consumeActionToken,
  createSession,
  deleteUserSessions,
  hashPassword,
  setSessionCookie,
} from "../service";
import { authRepository } from "../repository";

/**
 * Reset password
 *
 * `POST /api/auth/reset-password`
 *
 * Consumes a reset token, updates the password, invalidates existing sessions,
 * and starts a new session.
 *
 * @param c - Public request context
 * @returns 200 with the me payload and session cookie set
 */
export async function resetPassword(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, resetPasswordSchema);

  // -- Processing ------------------------------------------------------------
  const userId = await consumeActionToken(data.token, "reset_password");
  if (!userId) throw new HttpError(400, "Invalid or expired link — request a new one");

  const user = await authRepository.updateUser(userId, {
    passwordHash: hashPassword(data.password),
  });
  await deleteUserSessions(userId);

  const sessionToken = await createSession(userId);

  // -- Output ----------------------------------------------------------------
  setSessionCookie(c, sessionToken);
  return c.json(await buildMe(user));
}
