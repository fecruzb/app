import { hashPassword } from "../lib/crypto";
import { db, sql } from "../lib/db";
import { authRepository } from "../domains/auth/repository";
import { notes } from "../domains/note/schema";
import { createTenantWithOwner } from "../domains/tenant/service";

// Seed idempotente com um usuário demo para desenvolvimento.
// Login: demo@example.com / demo1234

const DEMO_EMAIL = "demo@example.com";

async function seed() {
  if (await authRepository.findUserByEmail(DEMO_EMAIL)) {
    console.log("[seed] usuário demo já existe, nada a fazer");
    return;
  }

  const user = await authRepository.insertUser({
    name: "Usuária Demo",
    email: DEMO_EMAIL,
    passwordHash: hashPassword("demo1234"),
    emailVerifiedAt: new Date(),
  });

  const tenant = await createTenantWithOwner("Empresa Demo", user.id);

  await db.insert(notes).values([
    {
      tenantId: tenant.id,
      authorId: user.id,
      title: "Bem-vindo ao app-base",
      content:
        "Este é um recurso de exemplo (notes) mostrando o padrão CRUD por tenant. Troque-o pelo domínio do seu produto.",
    },
    {
      tenantId: tenant.id,
      authorId: user.id,
      title: "Próximos passos",
      content:
        "1. Renomeie o app no README\n2. Substitua notes pelo seu domínio\n3. Ajuste a landing page\n4. Configure RESEND_API_KEY para e-mails reais",
    },
  ]);

  console.log(`[seed] criado: ${DEMO_EMAIL} / demo1234 (tenant "${tenant.name}")`);
}

seed()
  .catch((err) => {
    console.error("[seed] erro:", err);
    process.exitCode = 1;
  })
  .finally(() => sql.end());
