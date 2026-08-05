import { registerSchema } from "@app/shared";
import { env } from "@/lib/env";
import { HttpError, parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { createTenantWithOwner } from "@/domains/tenant/service";
import { buildMe } from "../dto";
import { authRepository } from "../repository";
import { createSession, hashPassword, sendVerificationEmail, setSessionCookie } from "../service";

export async function register(c: AppContext) {
  if (!env.selfSignupEnabled) {
    throw new HttpError(403, "Sign-up is disabled — ask an administrator for an invite");
  }
  const data = await parseBody(c, registerSchema);

  if (await authRepository.findUserByEmail(data.email)) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const user = await authRepository.insertUser({
    name: data.name,
    email: data.email,
    passwordHash: hashPassword(data.password),
  });

  // Every user gets a personal tenant where they are the owner
  const firstName = data.name.split(" ")[0];
  await createTenantWithOwner(`${firstName}'s Workspace`, user.id);

  await sendVerificationEmail(user);
  setSessionCookie(c, await createSession(user.id));
  return c.json(await buildMe(user), 201);
}
