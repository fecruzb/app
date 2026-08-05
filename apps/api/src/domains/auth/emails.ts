import { emailLayout } from "@/lib/email";

export function verifyEmailTemplate(name: string, url: string) {
  return {
    subject: "Confirme seu e-mail",
    html: emailLayout(
      "Confirme seu e-mail",
      `<p>Olá, ${name}! Confirme seu endereço de e-mail para concluir o cadastro. O link expira em 24 horas.</p>`,
      "Confirmar e-mail",
      url,
    ),
  };
}

export function resetPasswordTemplate(name: string, url: string) {
  return {
    subject: "Redefinição de senha",
    html: emailLayout(
      "Redefinir senha",
      `<p>Olá, ${name}! Recebemos um pedido para redefinir sua senha. O link expira em 1 hora.</p><p>Se você não pediu isso, ignore este e-mail.</p>`,
      "Redefinir senha",
      url,
    ),
  };
}
