import { hashPassword } from "@/lib/crypto";
import { db, sql } from "./client";
import { authRepository } from "@/domains/auth/repository";
import { tasks } from "@/domains/task/schema";
import { createTenantWithOwner } from "@/domains/tenant/service";

// Idempotent seed with a demo user for development.
// Login: demo@example.com / demo1234 (platform admin)

const DEMO_EMAIL = "demo@example.com";

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

  const user = await authRepository.insertUser({
    name: "Demo User",
    email: DEMO_EMAIL,
    passwordHash: hashPassword("demo1234"),
    emailVerifiedAt: new Date(),
    isPlatformAdmin: true,
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

  console.log(`[seed] created: ${DEMO_EMAIL} / demo1234 (tenant "${tenant.name}", platform admin)`);
}

seed()
  .catch((err) => {
    console.error("[seed] error:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
