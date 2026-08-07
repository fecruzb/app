import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { brand } from "@app/shared";
import { z } from "zod";

const moduleDir = dirname(fileURLToPath(import.meta.url));

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
  /** Image generation model behind the agent's generate_article_cover tool. */
  IMAGE_MODEL: z.string().default("gpt-image-1-mini"),
  MAIL_FROM: z.string().default(brand.defaultMailFrom),
  /** When "false", accounts can only be created via invite. */
  SELF_SIGNUP_ENABLED: z
    .string()
    .default("true")
    .transform((v) => v !== "false"),
  /**
   * Comma-separated emails that are always platform admins once verified.
   * Independent of the DB flag — change the env and access follows on next request.
   */
  PLATFORM_ADMIN_EMAILS: z.string().optional(),
  NODE_ENV: z.string().default("development"),

  // Image storage (R2, Cloudflare): without these four the API falls back to
  // writing images to the local filesystem (dev only — Render's disk is ephemeral).
  CLOUDFLARE_S3_API: z.string().optional(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_MEDIA_BUCKET: z.string().default("app"),
  /** Public origin of the bucket (r2.dev or a custom domain); empty = R2 disabled. */
  R2_PUBLIC_BASE_URL: z.string().default(""),
  /** Local media root when R2 is off. Defaults to the web app's public/ folder. */
  MEDIA_DIR: z.string().optional(),
  /**
   * Demo user password for `db:seed`. When unset, seed generates a random
   * password and prints it once. Local-only — never set on Render.
   */
  SEED_DEMO_PASSWORD: z.string().optional(),
  /**
   * Comma-separated Origins allowed for credentialed CORS (Tauri shells +
   * local Vite ports). Empty = CORS middleware off (browser same-origin only).
   */
  CORS_ORIGIN: z.string().optional(),
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
  imageModel: raw.IMAGE_MODEL,
  mailFrom: raw.MAIL_FROM,
  selfSignupEnabled: raw.SELF_SIGNUP_ENABLED,
  /** Lowercased emails from PLATFORM_ADMIN_EMAILS (empty set when unset). */
  platformAdminEmails: new Set(
    (raw.PLATFORM_ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  ),
  isProduction: raw.NODE_ENV === "production",

  r2: {
    endpoint: raw.CLOUDFLARE_S3_API?.trim() || null,
    accessKeyId: raw.CLOUDFLARE_ACCESS_KEY_ID?.trim() || null,
    secretAccessKey: raw.CLOUDFLARE_SECRET_ACCESS_KEY?.trim() || null,
    bucket: raw.CLOUDFLARE_MEDIA_BUCKET.trim() || "app",
    publicBaseUrl: raw.R2_PUBLIC_BASE_URL.trim().replace(/\/+$/, ""),
  },
  /**
   * Local media root when R2 is off. Defaults to the web app's public/
   * folder (gitignored — local-only media, never committed).
   */
  mediaDir: raw.MEDIA_DIR ? resolve(raw.MEDIA_DIR) : resolve(moduleDir, "../../../web/public"),
  /** Demo password for seed; null means seed generates and prints one. */
  seedDemoPassword: raw.SEED_DEMO_PASSWORD?.trim() || null,
  /** Allowed CORS origins (empty set = middleware off). */
  corsOrigins: new Set(
    (raw.CORS_ORIGIN ?? "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  ),
};
