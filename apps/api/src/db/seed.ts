/**
 * Demo seed
 *
 * Idempotent seed with a demo user for development. Password comes from
 * `SEED_DEMO_PASSWORD` when set; otherwise a random one is generated and
 * written once to `apps/api/.seed-demo-password` (gitignored — never logged).
 */
import { randomBytes } from "node:crypto";
import { chmodSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "@/lib/crypto";
import { env } from "@/lib/env";
import { sql } from "./client";
import { authRepository } from "@/domains/auth/repository";
import { taskRepository } from "@/domains/task/repository";
import { createTenantWithOwner } from "@/domains/tenant/service";

const DEMO_EMAIL = "demo@example.com";
const SEED_PASSWORD_FILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../.seed-demo-password",
);

function demoPassword(): string {
  return env.seedDemoPassword ?? randomBytes(12).toString("base64url");
}

async function seed() {
  const existing = await authRepository.findUserByEmail(DEMO_EMAIL);
  if (existing) {
    if (!existing.isPlatformAdmin) {
      await authRepository.updateUser(existing.id, { isPlatformAdmin: true });
      console.log("[seed] promoted demo user to platform admin");
    } else {
      console.log("[seed] demo user already exists, nothing to do");
    }
    return;
  }

  const fromEnv = Boolean(env.seedDemoPassword);
  const password = demoPassword();
  const user = await authRepository.insertUser({
    name: "Demo User",
    email: DEMO_EMAIL,
    passwordHash: hashPassword(password),
    emailVerifiedAt: new Date(),
    isPlatformAdmin: true,
  });

  const tenant = await createTenantWithOwner("Demo Company", user.id);

  const seedTasks = [
    { title: "Rename the app in the README", completed: true },
    { title: "Replace tasks with your product's domain", completed: false },
    { title: "Adjust the landing page", completed: false },
    { title: "Set RESEND_API_KEY for real emails", completed: false },
  ];

  for (const task of seedTasks) {
    await taskRepository.insert({
      tenantId: tenant.id,
      authorId: user.id,
      title: task.title,
      completed: task.completed,
    });
  }

  console.log(`[seed] created demo user ${DEMO_EMAIL} (tenant "${tenant.name}", platform admin)`);
  if (fromEnv) {
    console.log("[seed] password from SEED_DEMO_PASSWORD (not printed)");
  } else {
    writeFileSync(SEED_PASSWORD_FILE, `${password}\n`, { mode: 0o600 });
    // mode on writeFileSync only applies on create — force owner-only on overwrite too
    chmodSync(SEED_PASSWORD_FILE, 0o600);
    console.log("[seed] password written to apps/api/.seed-demo-password (gitignored)");
  }
}

seed()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
