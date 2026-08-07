import { hashToken } from "@/lib/crypto";
import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { authRepository } from "@/domains/auth/repository";
import { toPublicPlatformInviteDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * Get platform invite details
 *
 * `GET /api/join/:token`
 *
 * Public handler for the join screen: returns invited email, inviter name, and
 * whether an account already exists for that email.
 *
 * @param c - Public request context
 * @returns 200 with the public platform invite DTO
 */
export async function getPlatformInvite(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const token = c.req.param("token") ?? "";

  // -- Processing ------------------------------------------------------------
  const row = await adminRepository.findValidPlatformInviteByTokenHash(hashToken(token));
  if (!row) throw new HttpError(404, "Invalid or expired invite");

  const existingUser = await authRepository.findUserByEmail(row.invite.email);

  // -- Output ----------------------------------------------------------------
  return c.json(toPublicPlatformInviteDto(row.invite, row.inviterName, existingUser !== null));
}
