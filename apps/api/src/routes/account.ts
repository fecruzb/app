import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { changePasswordSchema, updateAccountSchema } from "@app/shared";
import { db } from "../db/client";
import { users } from "../db/schema";
import { HttpError, parseBody } from "../lib/errors";
import { requireAuth, type AppEnv } from "../middleware/auth";
import { deleteUserSessions, hashPassword, verifyPassword } from "../services/auth";
import { toUserDto } from "../services/tenants";

export const accountRoutes = new Hono<AppEnv>();

accountRoutes.patch("/", requireAuth, async (c) => {
  const data = await parseBody(c, updateAccountSchema);
  const [user] = await db
    .update(users)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(users.id, c.get("user").id))
    .returning();
  return c.json(toUserDto(user));
});

accountRoutes.patch("/password", requireAuth, async (c) => {
  const data = await parseBody(c, changePasswordSchema);
  const user = c.get("user");

  if (!verifyPassword(user.passwordHash, data.currentPassword)) {
    throw new HttpError(400, "Senha atual incorreta");
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(data.newPassword), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  // Invalida as outras sessões, mantendo a atual
  await deleteUserSessions(user.id, c.get("sessionToken"));
  return c.json({ ok: true });
});
