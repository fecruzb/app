import { brand } from "@app/shared";
import { emailLayout } from "@/lib/email";

/**
 * Platform invite template
 *
 * Signup invite outside SELF_SIGNUP_ENABLED (not tenant-scoped).
 *
 * @param inviterName - Platform admin who sent the invite, if known
 * @param url - Absolute join URL including the raw token
 * @returns Subject and HTML body
 */
export function platformInviteTemplate(inviterName: string | null, url: string) {
  const who = inviterName ? `${inviterName} invited you` : "You've been invited";
  const heading = `You're invited to ${brand.displayName}`;
  return {
    subject: heading,
    html: emailLayout(
      heading,
      `<p>${who} to create an account and try the app. This invite expires in 7 days.</p>`,
      "Create your account",
      url,
    ),
  };
}
