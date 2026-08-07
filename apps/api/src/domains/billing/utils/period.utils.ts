/**
 * Billing period helpers
 *
 * UTC calendar-month bounds and micros → USD display for entitlement messages.
 */

/**
 * Start of the current UTC calendar month
 *
 * @param now - Reference instant
 * @returns Month start
 */
export function monthStart(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Start of the next UTC calendar month
 *
 * @param now - Reference instant
 * @returns Next month start
 */
export function monthEnd(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

/**
 * Format micros as a short USD string
 *
 * @param micros - Amount in millionths of a dollar
 * @returns Display string like `"$1.23"`
 */
export function formatUsd(micros: number): string {
  if (micros > 0 && micros < 10_000) return "<$0.01";
  return `$${(micros / 1_000_000).toFixed(2)}`;
}
