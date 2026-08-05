import { loginSchema } from "@app/shared";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { buildMe } from "../dto";
import { authRepository } from "../repository";
import { createSession, setSessionCookie, verifyPassword } from "../service";

export async function login(c: AppContext) {
  const data = await parseBody(c, loginSchema);

  const user = await authRepository.findUserByEmail(data.email);
  // Generic message to avoid revealing whether the email exists
  if (!user || !verifyPassword(user.passwordHash, data.password)) {
    throw new HttpError(401, "Invalid email or password");
  }

  setSessionCookie(c, await createSession(user.id));
  return c.json(await buildMe(user));
}
