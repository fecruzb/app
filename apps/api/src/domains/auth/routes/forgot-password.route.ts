import { forgotPasswordSchema } from "@app/shared";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { resetPasswordTemplate } from "../emails";
import { authRepository } from "../repository";
import { createActionToken } from "../service";

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
  const user = await authRepository.findUserByEmail(data.email);
  if (user) {
    const token = await createActionToken(user.id, "reset_password");
    const { subject, html } = resetPasswordTemplate(
      user.name,
      `${env.appUrl}/reset-password/${token}`,
    );
    void sendEmail({ to: user.email, subject, html });
  }

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
