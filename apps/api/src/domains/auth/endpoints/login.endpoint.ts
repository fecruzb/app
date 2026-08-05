import { loginSchema } from "@app/shared";
import { HttpError, parseBody } from "../../../lib/errors";
import type { AppContext } from "../../../lib/http";
import { buildMe } from "../dto";
import { authRepository } from "../repository";
import { createSession, setSessionCookie, verifyPassword } from "../service";

export async function login(c: AppContext) {
  const data = await parseBody(c, loginSchema);

  const user = await authRepository.findUserByEmail(data.email);
  // Mensagem genérica para não revelar se o e-mail existe
  if (!user || !verifyPassword(user.passwordHash, data.password)) {
    throw new HttpError(401, "E-mail ou senha inválidos");
  }

  setSessionCookie(c, await createSession(user.id));
  return c.json(await buildMe(user));
}
