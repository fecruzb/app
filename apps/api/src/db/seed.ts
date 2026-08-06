/**
 * Demo seed
 *
 * Idempotent seed with a demo user for development. Password comes from
 * `SEED_DEMO_PASSWORD` when set; otherwise a random one is generated and
 * printed once (never hardcoded in the repo).
 */
import { randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/crypto";
import { env } from "@/lib/env";
import { sql } from "./client";
import { authRepository } from "@/domains/auth/repository";
import { taskRepository } from "@/domains/task/repository";
import { createTenantWithOwner } from "@/domains/tenant/service";

const DEMO_EMAIL = "demo@example.com";

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
  console.log(`[seed] password: ${password}`);
}

seed()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
