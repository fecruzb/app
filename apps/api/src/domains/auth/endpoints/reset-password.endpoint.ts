import { resetPasswordSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { buildMe } from "../dto";
import { authRepository } from "../repository";
import {
  consumeActionToken,
  createSession,
  deleteUserSessions,
  hashPassword,
  setSessionCookie,
} from "../service";

export async function resetPassword(c: AppContext) {
  const data = await parseBody(c, resetPasswordSchema);

  const userId = await consumeActionToken(data.token, "reset_password");
  if (!userId) throw new HttpError(400, "Invalid or expired link — request a new one");

  const user = await authRepository.updateUser(userId, {
    passwordHash: hashPassword(data.password),
  });
  await deleteUserSessions(userId);

  setSessionCookie(c, await createSession(userId));
  return c.json(await buildMe(user));
}
