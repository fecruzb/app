/**
 * Usage service
 *
 * Thin wrappers around billing entitlements for the account AI card. Seat and
 * plan gates live in `@/domains/billing/service`.
 */
import type { AiUsageDto } from "@app/shared";
import { getTenantBilling } from "@/domains/billing/service";

/**
 * Get AI usage for the current viewer in a tenant
 *
 * Maps the billing snapshot into the existing AiUsageDto shape.
 *
 * @param userId - User id
 * @param tenantId - Tenant id
 * @returns Usage DTO for the current UTC month
 */
export async function getAiUsage(userId: string, tenantId: string): Promise<AiUsageDto> {
  const billing = await getTenantBilling(tenantId, userId);
  return {
    periodStart: billing.periodStart,
    periodEnd: billing.periodEnd,
    spentMicros: billing.viewerSpentMicros,
    limitMicros: billing.aiPerSeatMicros,
    remainingMicros: billing.viewerRemainingMicros,
    requestCount: billing.viewerRequestCount,
    overLimit: billing.viewerOverLimit,
  };
}

export { assertAiBudget } from "@/domains/billing/service";
