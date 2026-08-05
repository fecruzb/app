import { eq } from "drizzle-orm";
import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@app/shared";
import { db } from "../db/client";
import { users, type User } from "../db/schema";
import { env } from "../lib/env";
import { HttpError, parseBody } from "../lib/errors";
import { requireAuth, type AppEnv } from "../middleware/auth";
import {
  consumeActionToken,
  createActionToken,
  createSession,
  deleteSession,
  deleteUserSessions,
  hashPassword,
  SESSION_COOKIE,
  SESSION_TTL_MS,
  verifyPassword,
} from "../services/auth";
import { resetPasswordTemplate, sendEmail, verifyEmailTemplate } from "../services/email";
import { buildMe, createTenantWithOwner } from "../services/tenants";

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    secure: env.isProduction,
    maxAge: SESSION_TTL_MS / 1000,
  });
}

async function sendVerificationEmail(user: User): Promise<void> {
  const token = await createActionToken(user.id, "verify_email");
  const { subject, html } = verifyEmailTemplate(user.name, `${env.appUrl}/verify-email/${token}`);
  void sendEmail({ to: user.email, subject, html });
}

export const authRoutes = new Hono<AppEnv>();

authRoutes.post("/register", async (c) => {
  if (!env.selfSignupEnabled) {
    throw new HttpError(403, "Cadastro desativado — peça um convite a um administrador");
  }
  const data = await parseBody(c, registerSchema);

  const [existing] = await db.select().from(users).where(eq(users.email, data.email));
  if (existing) throw new HttpError(409, "Já existe uma conta com este e-mail");

  const [user] = await db
    .insert(users)
    .values({ name: data.name, email: data.email, passwordHash: hashPassword(data.password) })
    .returning();

  // Todo usuário nasce com um tenant pessoal onde é owner
  const firstName = data.name.split(" ")[0];
  await createTenantWithOwner(`Espaço de ${firstName}`, user.id);

  await sendVerificationEmail(user);
  setSessionCookie(c, await createSession(user.id));
  return c.json(await buildMe(user), 201);
});

authRoutes.post("/login", async (c) => {
  const data = await parseBody(c, loginSchema);

  const [user] = await db.select().from(users).where(eq(users.email, data.email));
  // Mensagem genérica para não revelar se o e-mail existe
  if (!user || !verifyPassword(user.passwordHash, data.password)) {
    throw new HttpError(401, "E-mail ou senha inválidos");
  }

  setSessionCookie(c, await createSession(user.id));
  return c.json(await buildMe(user));
});

authRoutes.post("/logout", async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await deleteSession(token);
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.json({ ok: true });
});

authRoutes.get("/me", requireAuth, async (c) => {
  return c.json(await buildMe(c.get("user")));
});

authRoutes.post("/forgot-password", async (c) => {
  const data = await parseBody(c, forgotPasswordSchema);

  const [user] = await db.select().from(users).where(eq(users.email, data.email));
  if (user) {
    const token = await createActionToken(user.id, "reset_password");
    const { subject, html } = resetPasswordTemplate(
      user.name,
      `${env.appUrl}/reset-password/${token}`,
    );
    void sendEmail({ to: user.email, subject, html });
  }
  // Sempre 200 para não revelar se o e-mail existe
  return c.json({ ok: true });
});

authRoutes.post("/reset-password", async (c) => {
  const data = await parseBody(c, resetPasswordSchema);

  const userId = await consumeActionToken(data.token, "reset_password");
  if (!userId) throw new HttpError(400, "Link inválido ou expirado — peça um novo");

  await db
    .update(users)
    .set({ passwordHash: hashPassword(data.password), updatedAt: new Date() })
    .where(eq(users.id, userId));
  await deleteUserSessions(userId);

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  setSessionCookie(c, await createSession(userId));
  return c.json(await buildMe(user));
});

authRoutes.post("/verify-email", async (c) => {
  const data = await parseBody(c, verifyEmailSchema);

  const userId = await consumeActionToken(data.token, "verify_email");
  if (!userId) throw new HttpError(400, "Link inválido ou expirado — peça um novo");

  await db
    .update(users)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));
  return c.json({ ok: true });
});

authRoutes.post("/resend-verification", requireAuth, async (c) => {
  const user = c.get("user");
  if (user.emailVerifiedAt) throw new HttpError(400, "E-mail já verificado");
  await sendVerificationEmail(user);
  return c.json({ ok: true });
});
