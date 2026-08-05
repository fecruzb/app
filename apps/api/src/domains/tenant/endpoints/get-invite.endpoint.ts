// Public endpoint: invite details for the accept screen.
import type { PublicInviteDto } from "@app/shared";
import { hashToken } from "@/lib/crypto";
import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import { tenantRepository } from "../repository";

export async function getInvite(c: AppContext) {
  const token = c.req.param("token") ?? "";
  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Invalid or expired invite");

  const existingUser = await authRepository.findUserByEmail(row.invite.email);
  const dto: PublicInviteDto = {
    tenantName: row.tenant.name,
    email: row.invite.email,
    role: row.invite.role,
    userExists: existingUser !== null,
  };
  return c.json(dto);
}
