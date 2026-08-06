import type { AppContext } from "@/context";
import { getAiUsage as getAiUsageForUser } from "../service";

/**
 * Get AI usage
 *
 * `GET /api/usage/ai`
 *
 * Returns the authenticated user's AI spend and budget for the current UTC month.
 *
 * @param c - Authenticated request context
 * @returns 200 with the AI usage DTO
 */
export async function getAiUsage(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const userId = c.get("user").id;

  // -- Processing ------------------------------------------------------------
  const usage = await getAiUsageForUser(userId);

  // -- Output ----------------------------------------------------------------
  return c.json(usage);
}
