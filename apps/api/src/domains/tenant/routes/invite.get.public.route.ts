import { hashToken } from "@/lib/crypto";
import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import { toPublicInviteDto } from "../dto";
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
  return c.json(toPublicInviteDto(row.invite, row.tenant, existingUser !== null));
}
