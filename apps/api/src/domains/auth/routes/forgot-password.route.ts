import { forgotPasswordSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { sendPasswordResetEmail } from "../service";

/**
 * Request a password reset
 *
 * `POST /api/auth/forgot-password`
 *
 * If the email matches an account, sends a reset link. Always returns success
 * so responses do not reveal whether the email exists.
 *
 * @param c - Public request context
 * @returns 200 with `{ ok: true }`
 */
export async function forgotPassword(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, forgotPasswordSchema);

  // -- Processing ------------------------------------------------------------
  await sendPasswordResetEmail(data.email);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
