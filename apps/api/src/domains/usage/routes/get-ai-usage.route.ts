import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { tenantRepository } from "@/domains/tenant/repository";
import { getAiUsage as getAiUsageForViewer } from "../service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Get AI usage
 *
 * `GET /api/usage/ai?tenantId=`
 *
 * Returns the authenticated user's AI spend against the tenant plan allowance
 * for the current UTC month.
 *
 * @param c - Authenticated request context
 * @returns 200 with the AI usage DTO
 */
export async function getAiUsage(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const userId = c.get("user").id;
  const tenantId = c.req.query("tenantId") ?? "";
  if (!UUID_RE.test(tenantId)) throw new HttpError(400, "tenantId is required");

  // -- Processing ------------------------------------------------------------
  const membership = await tenantRepository.findMember(tenantId, userId);
  if (!membership) throw new HttpError(404, "Tenant not found");

  const usage = await getAiUsageForViewer(userId, tenantId);

  // -- Output ----------------------------------------------------------------
  return c.json(usage);
}
