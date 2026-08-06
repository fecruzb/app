import { z } from "zod";

/** Product plan identifiers — catalog lives in the API; this is the contract. */
export const planIds = ["free", "starter", "pro", "usage"] as const;
export type PlanId = (typeof planIds)[number];

export const planIdSchema = z.enum(planIds);

/** How AI spend is billed for a plan. */
export type AiBillingMode = "included" | "passthrough";

/** Plan catalog entry returned to clients. */
export type PlanDto = {
  id: PlanId;
  /** Max members + pending invites; null = unlimited. */
  maxSeats: number | null;
  /** Seat price in micro-dollars (display / future charge). */
  pricePerSeatMicros: number;
  /** Per-member monthly AI allowance in micro-dollars; 0 = no hard cap. */
  aiPerSeatMicros: number;
  aiBilling: AiBillingMode;
};

/** One member's AI spend inside the tenant for the current period. */
export type BillingMemberUsageDto = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  spentMicros: number;
  requestCount: number;
  overLimit: boolean;
};

/** Tenant plan + seat/AI consumption for the current viewer. */
export type TenantBillingDto = {
  planId: PlanId;
  maxSeats: number | null;
  seatsUsed: number;
  memberCount: number;
  pendingInviteCount: number;
  pricePerSeatMicros: number;
  aiBilling: AiBillingMode;
  /** Per-member AI allowance (0 = passthrough / no block). */
  aiPerSeatMicros: number;
  /** Implied tenant AI ceiling when included (`maxSeats * aiPerSeat`); null if unlimited seats or passthrough. */
  aiTenantCeilingMicros: number | null;
  periodStart: string;
  periodEnd: string;
  /** Current viewer's spend in this tenant this period. */
  viewerSpentMicros: number;
  viewerRequestCount: number;
  viewerRemainingMicros: number;
  viewerOverLimit: boolean;
  /** All members' spend in this tenant this period. */
  tenantSpentMicros: number;
  tenantRequestCount: number;
  /** Per-member breakdown (every seat, including $0 spend). */
  members: BillingMemberUsageDto[];
};
