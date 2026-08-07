/**
 * Plan catalog
 *
 * Product entitlements for seats and AI. Edit this file when forking — tenants
 * store only `planId`; Stripe (or any PSP) later writes the same field.
 */
import type { PlanDto } from "@app/shared";

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
