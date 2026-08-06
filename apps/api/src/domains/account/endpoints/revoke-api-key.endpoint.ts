import { uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { revokeApiKey as revokeApiKeyForUser } from "@/domains/auth/service";

/**
 * Revoke an API key
 *
 * `DELETE /api/account/api-keys/:keyId`
 *
 * Deletes an API key owned by the authenticated user.
 *
 * @param c - Authenticated request context
 * @returns 200 with `{ ok: true }`
 */
export async function revokeApiKey(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const userId = c.get("user").id;
  const keyId = uuidParam(c, "keyId");

  // -- Processing ------------------------------------------------------------
  await revokeApiKeyForUser(userId, keyId);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
