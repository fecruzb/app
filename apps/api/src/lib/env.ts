import { z } from "zod";

// Em dev o .env fica na raiz do monorepo; em produção o Render injeta as vars.
try {
  process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
} catch {
  // sem .env — usa defaults/vars do ambiente
}

// Validado no boot: se algo obrigatório faltar ou vier malformado, o processo
// para aqui com uma mensagem clara — em vez de quebrar na primeira query.
const schema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default("postgres://app:app@localhost:5442/app_base"),
  /** URL pública do app, usada nos links dos e-mails (no Render cai no RENDER_EXTERNAL_URL). */
  APP_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  /** Sem a chave, o agente fica desabilitado (o botão some do app). */
  OPENAI_API_KEY: z.string().optional(),
  ASSISTANT_MODEL: z.string().default("gpt-4o-mini"),
  MAIL_FROM: z.string().default("App Base <onboarding@resend.dev>"),
  /** Quando "false", contas só podem ser criadas via convite. */
  SELF_SIGNUP_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v !== "false"),
  NODE_ENV: z.string().default("development"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`[env] variáveis de ambiente inválidas:\n${issues}`);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  port: raw.PORT,
  databaseUrl: raw.DATABASE_URL,
  appUrl: raw.APP_URL ?? raw.RENDER_EXTERNAL_URL ?? "http://localhost:3000",
  resendApiKey: raw.RESEND_API_KEY ?? null,
  openaiApiKey: raw.OPENAI_API_KEY ?? null,
  assistantModel: raw.ASSISTANT_MODEL,
  mailFrom: raw.MAIL_FROM,
  selfSignupEnabled: raw.SELF_SIGNUP_ENABLED,
  isProduction: raw.NODE_ENV === "production",
};
