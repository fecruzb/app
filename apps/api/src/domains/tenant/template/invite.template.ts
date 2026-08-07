import { emailLayout } from "@/lib/email";

/**
 * Tenant invite template
 *
 * Invitation to join a specific workspace.
 *
 * @param tenantName - Workspace display name
 * @param inviterName - Person who sent the invite, if known
 * @param url - Absolute accept-invite URL including the raw token
 * @returns Subject and HTML body
 */
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
