import { verifyEmailSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { isEnvPlatformAdminEmail } from "../platform-admin";
import { authRepository } from "../repository";
import { consumeActionToken } from "../service";

/**
 * Verify email
 *
 * `POST /api/auth/verify-email`
 *
 * Consumes a verification token and marks the user's email as verified.
 * Env-listed platform admin emails also get the DB admin flag at this point.
 *
 * @param c - Public request context
 * @returns 200 with `{ ok: true }`
 */
export async function verifyEmail(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, verifyEmailSchema);

  // -- Processing ------------------------------------------------------------
  const userId = await consumeActionToken(data.token, "verify_email");
  if (!userId) throw new HttpError(400, "Invalid or expired link — request a new one");

  const user = await authRepository.findUserById(userId);
  if (!user) throw new HttpError(400, "Invalid or expired link — request a new one");

  const patch: { emailVerifiedAt: Date; isPlatformAdmin?: boolean } = {
    emailVerifiedAt: new Date(),
  };
  if (isEnvPlatformAdminEmail(user.email)) {
    patch.isPlatformAdmin = true;
  }
  await authRepository.updateUser(userId, patch);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
