import { z } from "zod";

// In dev the .env lives at the monorepo root; in production Render injects the vars.
try {
  process.loadEnvFile(new URL("../../../../.env", import.meta.url).pathname);
} catch {
  // no .env — use environment vars/defaults
}

// Validated at boot: missing or malformed required vars kill the process with a clear message.
const schema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().default("postgres://app:app@localhost:5442/app_base"),
  /** Public app URL used in email links (falls back to RENDER_EXTERNAL_URL on Render). */
  APP_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  /** Without the key the agent is disabled (button hidden in the app). */
  OPENAI_API_KEY: z.string().optional(),
  ASSISTANT_MODEL: z.string().default("gpt-4o-mini"),
  /** Speech-to-text model behind the assistant's voice input. */
  TRANSCRIBE_MODEL: z.string().default("gpt-4o-mini-transcribe"),
  /** Monthly AI spend cap per user. 0 keeps tracking but never blocks. */
  AI_MONTHLY_BUDGET_USD: z.coerce.number().min(0).default(10),
  MAIL_FROM: z.string().default("App Base <onboarding@resend.dev>"),
  /** When "false", accounts can only be created via invite. */
  SELF_SIGNUP_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v !== "false"),
  NODE_ENV: z.string().default("development"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`[env] invalid environment variables:\n${issues}`);
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
  transcribeModel: raw.TRANSCRIBE_MODEL,
  aiMonthlyBudgetMicros: Math.round(raw.AI_MONTHLY_BUDGET_USD * 1_000_000),
  mailFrom: raw.MAIL_FROM,
  selfSignupEnabled: raw.SELF_SIGNUP_ENABLED,
  isProduction: raw.NODE_ENV === "production",
};
