import { defineConfig } from "drizzle-kit";

// In dev the .env lives at the monorepo root; in production Render injects the vars.
try {
  process.loadEnvFile(new URL("../../.env", import.meta.url).pathname);
} catch {
  // no .env — use environment vars/defaults
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://app:app@localhost:5442/app_base",
  },
});
