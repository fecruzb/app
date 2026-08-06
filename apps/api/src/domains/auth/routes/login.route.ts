import { loginSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import {
  buildMe,
  createSession,
  meWithShellToken,
  setSessionCookie,
  verifyPassword,
} from "../service";
import { authRepository } from "../repository";

/**
 * Log in
 *
 * `POST /api/auth/login`
 *
 * Verifies email and password, creates a session cookie, and returns the
 * authenticated user payload. Uses a generic 401 so responses do not reveal
 * whether the email exists. Cross-origin shells also receive `sessionToken`.
 *
 * @param c - Public request context
 * @returns 200 with the me payload and session cookie set
 */
export async function login(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, loginSchema);

  // -- Processing ------------------------------------------------------------
  const user = await authRepository.findUserByEmail(data.email);
  if (!user || !verifyPassword(user.passwordHash, data.password)) {
    throw new HttpError(401, "Invalid email or password");
  }

  const sessionToken = await createSession(user.id);

  // -- Output ----------------------------------------------------------------
  setSessionCookie(c, sessionToken);
  return c.json(meWithShellToken(c, await buildMe(user), sessionToken));
}
