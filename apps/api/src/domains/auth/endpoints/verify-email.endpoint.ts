import { verifyEmailSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "../repository";
import { consumeActionToken } from "../service";

export async function verifyEmail(c: AppContext) {
  const data = await parseBody(c, verifyEmailSchema);

  const userId = await consumeActionToken(data.token, "verify_email");
  if (!userId) throw new HttpError(400, "Invalid or expired link — request a new one");

  await authRepository.updateUser(userId, { emailVerifiedAt: new Date() });
  return c.json({ ok: true });
}
