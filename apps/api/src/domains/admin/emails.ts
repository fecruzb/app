import { brand } from "@app/shared";
import { emailLayout } from "@/lib/email";

/** Email for a platform signup invite (not tenant-scoped). */
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
