import { changePasswordSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/lib/http";
import { authRepository } from "@/domains/auth/repository";
import { deleteUserSessions, hashPassword, verifyPassword } from "@/domains/auth/service";

export async function changePassword(c: AppContext) {
  const data = await parseBody(c, changePasswordSchema);
  const user = c.get("user");

  if (!verifyPassword(user.passwordHash, data.currentPassword)) {
    throw new HttpError(400, "Senha atual incorreta");
  }

  await authRepository.updateUser(user.id, { passwordHash: hashPassword(data.newPassword) });

  // Invalida as outras sessões, mantendo a atual
  await deleteUserSessions(user.id, c.get("sessionToken"));
  return c.json({ ok: true });
}
