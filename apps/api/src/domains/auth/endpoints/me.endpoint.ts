import type { AppContext } from "@/context";
import { buildMe } from "../dto";

/**
 * Get current user
 *
 * `GET /api/auth/me`
 *
 * Returns the authenticated user's me payload (profile, tenants, memberships).
 *
 * @param c - Authenticated request context
 * @returns 200 with the me payload
 */
export async function me(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const payload = await buildMe(user);

  // -- Output ----------------------------------------------------------------
  return c.json(payload);
}
