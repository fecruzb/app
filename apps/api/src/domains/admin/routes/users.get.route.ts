import type { AppContext } from "@/context";
import { toAdminUserDto } from "../dto";
import { adminRepository } from "../repository";

/**
 * List users
 *
 * `GET /api/admin/users`
 *
 * Lists every account with tenant membership counts for the platform admin.
 *
 * @param c - Platform admin request context
 * @returns 200 with admin user DTOs
 */
export async function listUsers(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  // Platform admin middleware already ran.

  // -- Processing ------------------------------------------------------------
  const rows = await adminRepository.listUsers();

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toAdminUserDto));
}
