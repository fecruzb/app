import type { AppContext } from "@/context";
import { listPlans as planCatalog } from "@/domains/billing/utils";

/**
 * List plans
 *
 * `GET /api/admin/plans`
 *
 * Returns the code plan catalog for the admin Plans page.
 *
 * @param c - Platform admin request context
 * @returns 200 with the plan DTO list
 */
export async function listPlans(c: AppContext) {
  // -- Input -----------------------------------------------------------------

  // -- Processing ------------------------------------------------------------
  const plans = planCatalog();

  // -- Output ----------------------------------------------------------------
  return c.json(plans);
}
