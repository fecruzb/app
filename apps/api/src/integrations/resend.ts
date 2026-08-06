// Resend integration for sending email. Without RESEND_API_KEY, logs the
// content to the console (useful in dev). Swap the email provider here —
// domains only call sendEmail.
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

/** Fire-and-forget: use `void sendEmail(...)` to avoid blocking the HTTP response. */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  if (!env.resendApiKey) {
    // Never log HTML — invite/reset/verify links embed raw tokens.
    logger.info(`[email] (dev, not sent) to: ${to} · subject: ${subject} · ${html.length} bytes`);
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
      logger.error(`[email] failed to send to ${to}:`, res.status, await res.text());
      return;
    }
    const { id } = (await res.json()) as { id: string };
    logger.info(`[email] sent to ${to} (resend id: ${id})`);
  } catch (err) {
    logger.error(`[email] error sending to ${to}:`, err);
  }
}
