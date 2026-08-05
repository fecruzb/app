// Todo acesso a dados do domínio auth passa por aqui — os endpoints e o
// service não escrevem SQL.
import { and, eq, gt, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { actionTokens, sessions, users, type ActionTokenPurpose, type User } from "./schema";

export const authRepository = {
  // -- users ---------------------------------------------------------------

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  },

  async findUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  async insertUser(values: {
    name: string;
    email: string;
    passwordHash: string;
    emailVerifiedAt?: Date;
  }): Promise<User> {
    const [user] = await db.insert(users).values(values).returning();
    return user;
  },

  async updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "passwordHash" | "emailVerifiedAt">>,
  ): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  // -- sessions ------------------------------------------------------------

  async insertSession(values: { tokenHash: string; userId: string; expiresAt: Date }) {
    await db.insert(sessions).values(values);
  },

  async findSessionUser(tokenHash: string): Promise<User | null> {
    const [row] = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())));
    return row?.user ?? null;
  },

  async deleteSessionByTokenHash(tokenHash: string) {
    await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  },

  /** Apaga as sessões do usuário; com exceptTokenHash, preserva a atual. */
  async deleteUserSessions(userId: string, exceptTokenHash?: string) {
    const where = exceptTokenHash
      ? and(eq(sessions.userId, userId), ne(sessions.tokenHash, exceptTokenHash))
      : eq(sessions.userId, userId);
    await db.delete(sessions).where(where);
  },

  // -- action tokens (verificação de e-mail / reset de senha) ---------------

  async replaceActionToken(values: {
    userId: string;
    purpose: ActionTokenPurpose;
    tokenHash: string;
    expiresAt: Date;
  }) {
    // Um token válido por vez por usuário/propósito
    await db
      .delete(actionTokens)
      .where(and(eq(actionTokens.userId, values.userId), eq(actionTokens.purpose, values.purpose)));
    await db.insert(actionTokens).values(values);
  },

  /** Valida e consome (deleta) o token; retorna o userId ou null. */
  async consumeActionToken(tokenHash: string, purpose: ActionTokenPurpose): Promise<string | null> {
    const [row] = await db
      .select()
      .from(actionTokens)
      .where(
        and(
          eq(actionTokens.tokenHash, tokenHash),
          eq(actionTokens.purpose, purpose),
          gt(actionTokens.expiresAt, new Date()),
        ),
      );
    if (!row) return null;
    await db.delete(actionTokens).where(eq(actionTokens.id, row.id));
    return row.userId;
  },
};
