/**
 * Billing service
 *
 * Seat and AI entitlements from the plan catalog. No payment provider — admin
 * assigns `planId`; forks wire Stripe (or similar) to the same field.
 */
import type { TenantBillingDto } from "@app/shared";
import { HttpError } from "@/lib/errors";
import { tenantRepository } from "@/domains/tenant/repository";
import { usageRepository } from "@/domains/usage/repository";
import { getPlan } from "./plans";

/**
 * Start of the current UTC calendar month
 *
 * @param now - Reference instant
 * @returns Month start
 */
function monthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Start of the next UTC calendar month
 *
 * @param now - Reference instant
 * @returns Next month start
 */
function monthEnd(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

/**
 * Format micros as a short USD string
 *
 * @param micros - Amount in millionths of a dollar
 * @returns Display string like `"$1.23"`
 */
function formatUsd(micros: number): string {
  if (micros > 0 && micros < 10_000) return "<$0.01";
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

/**
 * Assert the tenant has a free seat for a new invite
 *
 * Counts members + non-expired pending invites against `maxSeats`.
 *
 * @param tenantId - Tenant id
 * @throws {HttpError} 403 when the plan seat cap is reached
 */
export async function assertSeatAvailableForInvite(tenantId: string): Promise<void> {
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant) throw new HttpError(404, "Tenant not found");

  const plan = getPlan(tenant.planId);
  if (plan.maxSeats === null) return;

  const [memberCount, pendingInviteCount] = await Promise.all([
    tenantRepository.countMembers(tenantId),
    tenantRepository.countPendingInvites(tenantId),
  ]);

  if (memberCount + pendingInviteCount >= plan.maxSeats) {
    throw new HttpError(
      403,
      `Seat limit reached for the ${plan.id} plan (${plan.maxSeats} seats).`,
    );
  }
}

/**
 * Assert the tenant has room for an invite accept
 *
 * Pending invite already reserved a seat at create time; here we only ensure
 * members have not exceeded the cap (e.g. plan downgrade).
 *
 * @param tenantId - Tenant id
 * @throws {HttpError} 403 when the plan seat cap is reached
 */
export async function assertSeatAvailableForAccept(tenantId: string): Promise<void> {
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant) throw new HttpError(404, "Tenant not found");

  const plan = getPlan(tenant.planId);
  if (plan.maxSeats === null) return;

  const memberCount = await tenantRepository.countMembers(tenantId);
  if (memberCount >= plan.maxSeats) {
    throw new HttpError(
      403,
      `Seat limit reached for the ${plan.id} plan (${plan.maxSeats} seats).`,
    );
  }
}

/**
 * Tenant billing snapshot for the current viewer
 *
 * @param tenantId - Tenant id
 * @param userId - Viewing user id
 * @returns Billing DTO for the current UTC month
 */
export async function getTenantBilling(
  tenantId: string,
  userId: string,
): Promise<TenantBillingDto> {
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant) throw new HttpError(404, "Tenant not found");

  const plan = getPlan(tenant.planId);
  const now = new Date();
  const periodStart = monthStart(now);
  const periodEnd = monthEnd(now);

  const [members, pendingInviteCount, viewerTotals, tenantTotals, spendByUser] = await Promise.all([
    tenantRepository.listMembers(tenantId),
    tenantRepository.countPendingInvites(tenantId),
    usageRepository.sumUserTenantSpendSince(userId, tenantId, periodStart),
    usageRepository.sumTenantSpendSince(tenantId, periodStart),
    usageRepository.sumSpendByUserSince(tenantId, periodStart),
  ]);

  const memberCount = members.length;
  const seatsUsed = memberCount + pendingInviteCount;
  const limitMicros = plan.aiPerSeatMicros;
  const viewerOverLimit = limitMicros > 0 && viewerTotals.costMicros >= limitMicros;

  const aiTenantCeilingMicros =
    plan.aiBilling === "included" && plan.maxSeats !== null
      ? plan.maxSeats * plan.aiPerSeatMicros
      : null;

  const spendMap = new Map(spendByUser.map((row) => [row.userId, row]));

  return {
    planId: plan.id,
    maxSeats: plan.maxSeats,
    seatsUsed,
    memberCount,
    pendingInviteCount,
    pricePerSeatMicros: plan.pricePerSeatMicros,
    aiBilling: plan.aiBilling,
    aiPerSeatMicros: plan.aiPerSeatMicros,
    aiTenantCeilingMicros,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    viewerSpentMicros: viewerTotals.costMicros,
    viewerRequestCount: viewerTotals.requestCount,
    viewerRemainingMicros:
      limitMicros === 0 ? 0 : Math.max(0, limitMicros - viewerTotals.costMicros),
    viewerOverLimit,
    tenantSpentMicros: tenantTotals.costMicros,
    tenantRequestCount: tenantTotals.requestCount,
    members: members.map(({ member, user }) => {
      const totals = spendMap.get(user.id);
      const spentMicros = totals?.costMicros ?? 0;
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        spentMicros,
        requestCount: totals?.requestCount ?? 0,
        overLimit: limitMicros > 0 && spentMicros >= limitMicros,
      };
    }),
  };
}

/**
 * Assert the viewer's AI budget in this tenant
 *
 * Included plans cap spend per member; passthrough (`aiPerSeatMicros === 0`)
 * tracks without blocking.
 *
 * @param userId - User id
 * @param tenantId - Tenant id
 * @throws {HttpError} 402 when the monthly per-seat limit is reached
 */
export async function assertAiBudget(userId: string, tenantId: string): Promise<void> {
  const tenant = await tenantRepository.findById(tenantId);
  if (!tenant) throw new HttpError(404, "Tenant not found");

  const plan = getPlan(tenant.planId);
  const limitMicros = plan.aiPerSeatMicros;
  if (limitMicros === 0) return;

  const now = new Date();
  const { costMicros } = await usageRepository.sumUserTenantSpendSince(
    userId,
    tenantId,
    monthStart(now),
  );
  if (costMicros < limitMicros) return;

  const resets = monthEnd(now).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  throw new HttpError(
    402,
    `Monthly AI limit of ${formatUsd(limitMicros)} reached for this workspace. It resets on ${resets}.`,
  );
}
