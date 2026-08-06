/** Up to two uppercase initials from a name, for avatar fallbacks. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/**
 * Format micro-dollars as a localized USD string.
 *
 * @param micros - Amount in millionths of a dollar
 * @param locale - BCP 47 tag (e.g. `en-US`, `pt-BR`)
 * @param options.fractionDigits - Fixed fraction digits (default 2; use 0 for whole dollars)
 * @param options.lessThanCent - Label when `0 < micros < 10_000` (caller supplies via `t()`)
 */
export function formatUsdMicros(
  micros: number,
  locale: string,
  options?: { fractionDigits?: number; lessThanCent?: string },
): string {
  if (micros > 0 && micros < 10_000) {
    return options?.lessThanCent ?? "<$0.01";
  }
  const digits = options?.fractionDigits ?? 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(micros / 1_000_000);
}
