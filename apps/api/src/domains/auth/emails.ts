import { emailLayout } from "@/lib/email";

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
