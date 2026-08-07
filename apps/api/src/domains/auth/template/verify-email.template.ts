import { emailLayout } from "@/lib/email";

/**
 * Verify email template
 *
 * Confirm-signup message with a time-limited link.
 *
 * @param name - Recipient display name
 * @param url - Absolute verify-email URL including the raw token
 * @returns Subject and HTML body
 */
export function verifyEmailTemplate(name: string, url: string) {
  return {
    subject: "Confirm your email",
    html: emailLayout(
      "Confirm your email",
      `<p>Hi ${name}! Confirm your email address to finish signing up. This link expires in 24 hours.</p>`,
      "Confirm email",
      url,
    ),
  };
}
