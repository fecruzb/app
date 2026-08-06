import type { AppContext } from "@/context";
import { listPlans } from "@/domains/billing/plans";

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
export async function listPlansRoute(c: AppContext) {
  // -- Input -----------------------------------------------------------------

  // -- Processing ------------------------------------------------------------
  const plans = listPlans();

  // -- Output ----------------------------------------------------------------
  return c.json(plans);
}
