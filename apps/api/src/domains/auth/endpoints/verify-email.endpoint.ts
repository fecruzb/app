import { verifyEmailSchema } from "@app/shared";
import { HttpError, parseBody } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { authRepository } from "../repository";
import { consumeActionToken } from "../service";

export async function verifyEmail(c: AppContext) {
  const data = await parseBody(c, verifyEmailSchema);

  const userId = await consumeActionToken(data.token, "verify_email");
  if (!userId) throw new HttpError(400, "Link inválido ou expirado — peça um novo");

  await authRepository.updateUser(userId, { emailVerifiedAt: new Date() });
  return c.json({ ok: true });
}
