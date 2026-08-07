import { emailLayout } from "@/lib/email";

/**
 * Reset password template
 *
 * Password-reset message with a time-limited link.
 *
 * @param name - Recipient display name
 * @param url - Absolute reset-password URL including the raw token
 * @returns Subject and HTML body
 */
export function resetPasswordTemplate(name: string, url: string) {
  return {
    subject: "Password reset",
    html: emailLayout(
      "Reset password",
      `<p>Hi ${name}! We received a request to reset your password. This link expires in 1 hour.</p><p>If you didn't request this, ignore this email.</p>`,
      "Reset password",
      url,
    ),
  };
}
