import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { sendVerificationEmail } from "../service";

export async function resendVerification(c: AppContext) {
  const user = c.get("user");
  if (user.emailVerifiedAt) throw new HttpError(400, "Email already verified");
  await sendVerificationEmail(user);
  return c.json({ ok: true });
}
