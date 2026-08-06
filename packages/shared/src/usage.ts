// AI spend for the signed-in user. Money is always micro-dollars (USD * 1_000_000)
// so no float ever touches a balance.
export type AiUsageDto = {
  /** Start of the current billing month (UTC). */
  periodStart: string;
  /** When the counter resets (UTC). */
  periodEnd: string;
  spentMicros: number;
  /** 0 means usage is tracked but never blocked. */
  limitMicros: number;
  remainingMicros: number;
  requestCount: number;
  overLimit: boolean;
};
