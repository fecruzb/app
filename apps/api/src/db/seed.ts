import { hashPassword } from "@/lib/crypto";
import { db, sql } from "./client";
import { authRepository } from "@/domains/auth/repository";
import { tasks } from "@/domains/task/schema";
import { createTenantWithOwner } from "@/domains/tenant/service";

// Idempotent seed with a demo user for development.
// Login: demo@example.com / demo1234

const DEMO_EMAIL = "demo@example.com";

async function seed() {
  if (await authRepository.findUserByEmail(DEMO_EMAIL)) {
    console.log("[seed] demo user already exists, nothing to do");
    return;
  }

  const user = await authRepository.insertUser({
    name: "Demo User",
    email: DEMO_EMAIL,
    passwordHash: hashPassword("demo1234"),
    emailVerifiedAt: new Date(),
  });

  const tenant = await createTenantWithOwner("Demo Company", user.id);

  await db.insert(tasks).values([
    {
      tenantId: tenant.id,
      authorId: user.id,
      title: "Rename the app in the README",
      completed: true,
    },
    {
      tenantId: tenant.id,
      authorId: user.id,
      title: "Replace tasks with your product's domain",
      completed: false,
    },
    {
      tenantId: tenant.id,
      authorId: user.id,
      title: "Adjust the landing page",
      completed: false,
    },
    {
      tenantId: tenant.id,
      authorId: user.id,
      title: "Set RESEND_API_KEY for real emails",
      completed: false,
    },
  ]);

  console.log(`[seed] created: ${DEMO_EMAIL} / demo1234 (tenant "${tenant.name}")`);
}

seed()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
