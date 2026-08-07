import { updateAdminUserSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { isEnvPlatformAdminEmail } from "@/domains/auth/utils";
import { authRepository } from "@/domains/auth/repository";
import { toAdminUserDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * Update a user
 *
 * `PATCH /api/admin/users/:userId`
 *
 * Sets the platform admin flag. Admins cannot demote themselves.
 * Emails listed in PLATFORM_ADMIN_EMAILS cannot be demoted while the env stays set.
 *
 * @param c - Platform admin request context
 * @returns 200 with the updated admin user DTO
 */
export async function updateUser(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, updateAdminUserSchema);
  const userId = uuidParam(c, "userId");
  const actor = c.get("user");

  // -- Processing ------------------------------------------------------------
  if (userId === actor.id && data.isPlatformAdmin === false) {
    throw new HttpError(400, "You cannot remove your own platform admin access");
  }

  const existing = await authRepository.findUserById(userId);
  if (!existing) throw new HttpError(404, "User not found");

  if (data.isPlatformAdmin === false && isEnvPlatformAdminEmail(existing.email)) {
    throw new HttpError(
      400,
      "This user is listed in PLATFORM_ADMIN_EMAILS — remove them from the env to revoke access",
    );
  }

  const updated = await adminRepository.setPlatformAdmin(userId, data.isPlatformAdmin);
  if (!updated) throw new HttpError(404, "User not found");

  const row = await adminRepository.findUserWithTenantCount(userId);
  if (!row) throw new HttpError(404, "User not found");

  // -- Output ----------------------------------------------------------------
  return c.json(toAdminUserDto(row));
}
