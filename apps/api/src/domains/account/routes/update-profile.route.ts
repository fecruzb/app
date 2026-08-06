import { updateAccountSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toUserDto } from "@/domains/auth/dto";
import { authRepository } from "@/domains/auth/repository";

/**
 * Update profile
 *
 * `PATCH /api/account`
 *
 * Updates the authenticated user's display name.
 *
 * @param c - Authenticated request context
 * @returns 200 with the user DTO
 */
export async function updateProfile(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, updateAccountSchema);
  const userId = c.get("user").id;

  // -- Processing ------------------------------------------------------------
  const user = await authRepository.updateUser(userId, { name: data.name });

  // -- Output ----------------------------------------------------------------
  return c.json(toUserDto(user));
}
