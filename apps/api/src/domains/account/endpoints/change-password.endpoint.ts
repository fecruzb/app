import { changePasswordSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import { deleteUserSessions, hashPassword, verifyPassword } from "@/domains/auth/service";

/**
 * Change password
 *
 * `PATCH /api/account/password`
 *
 * Verifies the current password, updates the hash, and invalidates other
 * sessions while keeping the caller's session.
 *
 * @param c - Authenticated request context
 * @returns 200 with `{ ok: true }`
 */
export async function changePassword(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, changePasswordSchema);
  const user = c.get("user");
  const sessionToken = c.get("sessionToken");

  // -- Processing ------------------------------------------------------------
  if (!verifyPassword(user.passwordHash, data.currentPassword)) {
    throw new HttpError(400, "Current password is incorrect");
  }

  await authRepository.updateUser(user.id, { passwordHash: hashPassword(data.newPassword) });
  await deleteUserSessions(user.id, sessionToken);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
