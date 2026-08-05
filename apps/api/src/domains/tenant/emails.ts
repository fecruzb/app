import { emailLayout } from "@/lib/email";

export function inviteTemplate(tenantName: string, inviterName: string | null, url: string) {
  const who = inviterName ? `${inviterName} convidou você` : "Você foi convidado(a)";
  return {
    subject: `Convite para ${tenantName}`,
    html: emailLayout(
      `Convite para ${tenantName}`,
      `<p>${who} para participar de <strong>${tenantName}</strong>. O convite expira em 7 dias.</p>`,
      "Aceitar convite",
      url,
    ),
  };
}
