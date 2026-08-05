import { emailLayout } from "@/lib/email";

export function inviteTemplate(tenantName: string, inviterName: string | null, url: string) {
  const who = inviterName ? `${inviterName} invited you` : "You've been invited";
  return {
    subject: `Invitation to ${tenantName}`,
    html: emailLayout(
      `Invitation to ${tenantName}`,
      `<p>${who} to join <strong>${tenantName}</strong>. This invite expires in 7 days.</p>`,
      "Accept invite",
      url,
    ),
  };
}
