import type { AppContext } from "@/context";
import { toApiKeyDto } from "@/domains/auth/dto";
import { authRepository } from "@/domains/auth/repository";

/**
 * List API keys
 *
 * `GET /api/account/api-keys`
 *
 * Returns API keys owned by the authenticated user (metadata only, no raw keys).
 *
 * @param c - Authenticated request context
 * @returns 200 with an array of API key DTOs
 */
export async function listApiKeys(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const userId = c.get("user").id;

  // -- Processing ------------------------------------------------------------
  const keys = await authRepository.listApiKeys(userId);

  // -- Output ----------------------------------------------------------------
  return c.json(keys.map(toApiKeyDto));
}
