import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/client";
import { actionTokens, sessions, users, type User } from "../db/schema";

export const SESSION_COOKIE = "app_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

const TOKEN_TTL: Record<"verify_email" | "reset_password", number> = {
  verify_email: 24 * 60 * 60 * 1000,
  reset_password: 60 * 60 * 1000,
};

// ---------------------------------------------------------------------------
// Senhas — scrypt nativo, formato "salt$hash" (hex)
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}$${hash}`;
}

export function verifyPassword(stored: string, password: string): boolean {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}

// ---------------------------------------------------------------------------
// Tokens — o valor cru vai no cookie/e-mail; só o hash SHA-256 fica no banco
// ---------------------------------------------------------------------------

export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// ---------------------------------------------------------------------------
// Sessões
// ---------------------------------------------------------------------------

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  await db.insert(sessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  const [row] = await db
    .select({ user: users, sessionId: sessions.id })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())));
  return row?.user ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export async function deleteUserSessions(userId: string, exceptToken?: string): Promise<void> {
  if (exceptToken) {
    const rows = await db.select().from(sessions).where(eq(sessions.userId, userId));
    const keep = hashToken(exceptToken);
    for (const row of rows) {
      if (row.tokenHash !== keep) await db.delete(sessions).where(eq(sessions.id, row.id));
    }
    return;
  }
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// ---------------------------------------------------------------------------
// Action tokens (verificação de e-mail, reset de senha)
// ---------------------------------------------------------------------------

export async function createActionToken(
  userId: string,
  purpose: "verify_email" | "reset_password",
): Promise<string> {
  // Um token válido por vez por usuário/propósito
  await db
    .delete(actionTokens)
    .where(and(eq(actionTokens.userId, userId), eq(actionTokens.purpose, purpose)));

  const token = generateToken();
  await db.insert(actionTokens).values({
    userId,
    purpose,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TOKEN_TTL[purpose]),
  });
  return token;
}

/** Valida e consome (deleta) o token; retorna o userId ou null se inválido/expirado. */
export async function consumeActionToken(
  token: string,
  purpose: "verify_email" | "reset_password",
): Promise<string | null> {
  const [row] = await db
    .select()
    .from(actionTokens)
    .where(
      and(
        eq(actionTokens.tokenHash, hashToken(token)),
        eq(actionTokens.purpose, purpose),
        gt(actionTokens.expiresAt, new Date()),
      ),
    );
  if (!row) return null;
  await db.delete(actionTokens).where(eq(actionTokens.id, row.id));
  return row.userId;
}
