import { defineConfig } from "drizzle-kit";

// Em dev o .env fica na raiz do monorepo; em produção o Render injeta as vars.
try {
  process.loadEnvFile(new URL("../../.env", import.meta.url).pathname);
} catch {
  // sem .env — usa defaults/vars do ambiente
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://app:app@localhost:5442/app_base",
  },
});
