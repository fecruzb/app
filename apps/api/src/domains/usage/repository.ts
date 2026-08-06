/**
 * Usage repository
 *
 * Owns every SQL touch of AI usage events. Spend is scoped per user (global,
 * across tenants). Queries are written inline.
 */
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiUsageEvents } from "./schema";

/** Aggregated spend and request count for a user. */
export type UsageTotals = { costMicros: number; requestCount: number };

export const usageRepository = {
  /**
   * Sum user spend since a date
   *
   * Aggregated totals served by the (user, created_at) index.
   *
   * @param userId - User id
   * @param since - Inclusive lower bound on created_at
   * @returns Total cost in micros and request count
   */
  async sumUserSpendSince(userId: string, since: Date): Promise<UsageTotals> {
    const [row] = await db
      .select({
        costMicros: sql<string>`coalesce(sum(${aiUsageEvents.costMicros}), 0)`,
        requestCount: sql<string>`count(*)`,
      })
      .from(aiUsageEvents)
      .where(and(eq(aiUsageEvents.userId, userId), gte(aiUsageEvents.createdAt, since)));

    return {
      costMicros: Number(row?.costMicros ?? 0),
      requestCount: Number(row?.requestCount ?? 0),
    };
  },

  /**
   * Insert a usage event
   *
   * Append-only; no row returned.
   *
   * @param values - New usage event fields
   * @param values.userId - User who incurred the spend
   * @param values.tenantId - Tenant context, or null
   * @param values.model - Model id
   * @param values.inputTokens - Input token count
   * @param values.cachedInputTokens - Cached input token count
   * @param values.outputTokens - Output token count
   * @param values.rounds - Agent round count
   * @param values.costMicros - Cost in micros
   */
  async insert(values: {
    userId: string;
    tenantId: string | null;
    model: string;
    inputTokens: number;
    cachedInputTokens: number;
    outputTokens: number;
    rounds: number;
    costMicros: number;
  }): Promise<void> {
    await db.insert(aiUsageEvents).values(values);
  },
};
