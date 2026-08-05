// Em dev o .env fica na raiz do monorepo; em produção o Render injeta as vars.
try {
  process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
} catch {
  // sem .env — usa defaults/vars do ambiente
}

export const env = {
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? "postgres://app:app@localhost:5442/app_base",
  /** URL pública do app, usada nos links dos e-mails (no Render cai no RENDER_EXTERNAL_URL). */
  appUrl: process.env.APP_URL ?? process.env.RENDER_EXTERNAL_URL ?? "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY || null,
  /** Sem a chave, o agente fica desabilitado (o botão some do app). */
  openaiApiKey: process.env.OPENAI_API_KEY || null,
  assistantModel: process.env.ASSISTANT_MODEL ?? "gpt-4o-mini",
  mailFrom: process.env.MAIL_FROM ?? "App Base <onboarding@resend.dev>",
  /** Quando false, contas só podem ser criadas via convite. */
  selfSignupEnabled: (process.env.SELF_SIGNUP_ENABLED ?? "true") !== "false",
  isProduction: process.env.NODE_ENV === "production",
};
