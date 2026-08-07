/**
 * Plan catalog helpers
 *
 * Lookup against `PLAN_CATALOG`. Unknown ids fall back to `free`.
 */
import type { PlanDto, PlanId } from "@app/shared";
import { PLAN_CATALOG } from "../constants";

const byId = new Map(PLAN_CATALOG.map((p) => [p.id, p]));

/**
 * Resolve a plan by id
 *
 * Unknown ids fall back to `free` so a bad row never bricks entitlements.
 *
 * @param planId - Plan id from the tenant row
 * @returns Catalog entry
 */
export function getPlan(planId: string): PlanDto {
  return byId.get(planId as PlanId) ?? byId.get("free")!;
}

/**
 * List the plan catalog
 *
 * @returns All plans in display order
 */
export function listPlans(): PlanDto[] {
  return [...PLAN_CATALOG];
}
