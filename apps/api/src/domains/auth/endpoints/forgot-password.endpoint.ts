import { forgotPasswordSchema } from "@app/shared";
import { sendEmail } from "@/integrations/resend";
import { env } from "@/lib/env";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/lib/http";
import { resetPasswordTemplate } from "../emails";
import { authRepository } from "../repository";
import { createActionToken } from "../service";

export async function forgotPassword(c: AppContext) {
  const data = await parseBody(c, forgotPasswordSchema);

  const user = await authRepository.findUserByEmail(data.email);
  if (user) {
    const token = await createActionToken(user.id, "reset_password");
    const { subject, html } = resetPasswordTemplate(
      user.name,
      `${env.appUrl}/reset-password/${token}`,
    );
    void sendEmail({ to: user.email, subject, html });
  }
  // Sempre 200 para não revelar se o e-mail existe
  return c.json({ ok: true });
}
