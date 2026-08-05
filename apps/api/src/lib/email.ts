import { env } from "./env";
import { logger } from "./logger";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Envia via Resend quando RESEND_API_KEY está configurada; caso contrário,
 * loga o conteúdo no console (útil em dev). Sempre fire-and-forget:
 * use `void sendEmail(...)` para não bloquear a resposta HTTP.
 */
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

/** Layout base dos e-mails transacionais — os templates vivem em cada domínio. */
export function emailLayout(
  title: string,
  bodyHtml: string,
  ctaLabel: string,
  ctaUrl: string,
): string {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background:#f5f5f5;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#171717;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;">${title}</h1>
      <div style="font-size:15px;line-height:1.6;color:#404040;">${bodyHtml}</div>
      <a href="${ctaUrl}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#171717;color:#ffffff;text-decoration:none;border-radius:8px;font-size:15px;">${ctaLabel}</a>
      <p style="margin-top:24px;font-size:13px;color:#737373;">Se o botão não funcionar, copie e cole este link no navegador:<br /><a href="${ctaUrl}" style="color:#525252;word-break:break-all;">${ctaUrl}</a></p>
    </div>
  </body>
</html>`;
}
