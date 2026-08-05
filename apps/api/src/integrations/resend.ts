// Integração com o Resend para envio de e-mail. Sem RESEND_API_KEY, loga o
// conteúdo no console (útil em dev). Troque o provedor de e-mail aqui sem
// tocar nos domínios — eles só chamam sendEmail.
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/** Fire-and-forget: use `void sendEmail(...)` para não bloquear a resposta HTTP. */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  if (!env.resendApiKey) {
    logger.info(`\n[email] (dev, não enviado) para: ${to}\n[email] assunto: ${subject}\n${html}\n`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: env.mailFrom, to, subject, html }),
    });
    if (!res.ok) {
      logger.error(`[email] falha ao enviar para ${to}:`, res.status, await res.text());
      return;
    }
    const { id } = (await res.json()) as { id: string };
    logger.info(`[email] enviado para ${to} (resend id: ${id})`);
  } catch (err) {
    logger.error(`[email] erro ao enviar para ${to}:`, err);
  }
}
