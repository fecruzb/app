/**
 * Plan catalog
 *
 * Product entitlements for seats and AI. Edit this file when forking — tenants
 * store only `planId`; Stripe (or any PSP) later writes the same field.
 */
import type { PlanDto, PlanId } from "@app/shared";

const USD = 1_000_000;

/** All plans, in display order. */
export const PLAN_CATALOG: readonly PlanDto[] = [
  {
    id: "free",
    maxSeats: 1,
    pricePerSeatMicros: 0,
    aiPerSeatMicros: 5 * USD,
    aiBilling: "included",
  },
  {
    id: "starter",
    maxSeats: 3,
    pricePerSeatMicros: 5 * USD,
    aiPerSeatMicros: 5 * USD,
    aiBilling: "included",
  },
  {
    id: "pro",
    maxSeats: 10,
    pricePerSeatMicros: 5 * USD,
    aiPerSeatMicros: 5 * USD,
    aiBilling: "included",
  },
  {
    id: "usage",
    maxSeats: null,
    pricePerSeatMicros: 10 * USD,
    aiPerSeatMicros: 0,
    aiBilling: "passthrough",
  },
] as const;

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
