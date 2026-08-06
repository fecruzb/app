/**
 * Usage service
 *
 * Monthly AI budget: one global cap per user, counted in calendar months (UTC).
 */
import type { AiUsageDto } from "@app/shared";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/errors";
import { usageRepository } from "./repository";

/**
 * Start of the current UTC calendar month
 *
 * @param now - Reference instant
 * @returns Month start as a Date
 */
function monthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Start of the next UTC calendar month
 *
 * @param now - Reference instant
 * @returns Next month start as a Date
 */
function monthEnd(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

/**
 * Format micros as a short USD string
 *
 * @param micros - Amount in millionths of a dollar
 * @returns Display string like `"$1.23"` or `"<$0.01"`
 */
function formatUsd(micros: number): string {
  if (micros > 0 && micros < 10_000) return "<$0.01";
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

/**
 * Get AI usage for the current month
 *
 * Aggregates spend since month start and applies the configured budget.
 *
 * @param userId - User id
 * @returns Usage DTO for the current UTC month
 */
export async function getAiUsage(userId: string): Promise<AiUsageDto> {
  const now = new Date();
  const periodStart = monthStart(now);
  const limitMicros = env.aiMonthlyBudgetMicros;
  const { costMicros, requestCount } = await usageRepository.sumUserSpendSince(userId, periodStart);

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: monthEnd(now).toISOString(),
    spentMicros: costMicros,
    limitMicros,
    remainingMicros: limitMicros === 0 ? 0 : Math.max(0, limitMicros - costMicros),
    requestCount,
    overLimit: limitMicros > 0 && costMicros >= limitMicros,
  };
}

/**
 * Assert AI budget
 *
 * Gate checked before every assistant request. The check happens up front, so a
 * single request may overshoot the cap by its own cost — cents at current models.
 *
 * @param userId - User id
 * @throws {HttpError} 402 when the monthly limit is already reached
 */
export async function assertAiBudget(userId: string): Promise<void> {
  const limitMicros = env.aiMonthlyBudgetMicros;
  if (limitMicros === 0) return;

  const now = new Date();
  const { costMicros } = await usageRepository.sumUserSpendSince(userId, monthStart(now));
  if (costMicros < limitMicros) return;

  const resets = monthEnd(now).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  throw new HttpError(
    402,
    `Monthly AI limit of ${formatUsd(limitMicros)} reached. It resets on ${resets}.`,
  );
}
