import type { PublicInviteDto } from "@app/shared";
import { hashToken } from "@/lib/crypto";
import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import { tenantRepository } from "../repository";

/**
 * Get invite details
 *
 * `GET /api/invites/:token`
 *
 * Public handler for the accept screen: returns tenant name, invited email,
 * role, and whether an account already exists for that email.
 *
 * @param c - Public request context
 * @returns 200 with the public invite DTO
 */
export async function getInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const token = c.req.param("token") ?? "";

  // -- Processing ------------------------------------------------------------
  const row = await tenantRepository.findValidInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Invalid or expired invite");

  const existingUser = await authRepository.findUserByEmail(row.invite.email);

  // -- Output ----------------------------------------------------------------
  const dto: PublicInviteDto = {
    tenantName: row.tenant.name,
    email: row.invite.email,
    role: row.invite.role,
    userExists: existingUser !== null,
  };
  return c.json(dto);
}
