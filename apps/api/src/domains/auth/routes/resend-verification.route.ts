import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { sendVerificationEmail } from "../service";

/**
 * Resend verification email
 *
 * `POST /api/auth/resend-verification`
 *
 * Sends another verification email for the authenticated user when their email
 * is not yet verified.
 *
 * @param c - Authenticated request context
 * @returns 200 with `{ ok: true }`
 */
export async function resendVerification(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  if (user.emailVerifiedAt) throw new HttpError(400, "Email already verified");
  await sendVerificationEmail(user);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
