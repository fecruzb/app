/**
 * Usage repository
 *
 * Owns every SQL touch of AI usage events. Product gates use per-user spend
 * inside a tenant; events still record both ids for audit.
 */
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiUsageEvents } from "./schema";

/** Aggregated spend and request count. */
export type UsageTotals = { costMicros: number; requestCount: number };

/** Per-user totals inside a tenant. */
export type UserUsageTotals = UsageTotals & { userId: string };

export const usageRepository = {
  /**
   * Sum user spend in a tenant since a date
   *
   * Used for per-seat AI entitlements.
   *
   * @param userId - User id
   * @param tenantId - Tenant id
   * @param since - Inclusive lower bound on created_at
   * @returns Total cost in micros and request count
   */
  async sumUserTenantSpendSince(
    userId: string,
    tenantId: string,
    since: Date,
  ): Promise<UsageTotals> {
    const [row] = await db
      .select({
        costMicros: sql<string>`coalesce(sum(${aiUsageEvents.costMicros}), 0)`,
        requestCount: sql<string>`count(*)`,
      })
      .from(aiUsageEvents)
      .where(
        and(
          eq(aiUsageEvents.userId, userId),
          eq(aiUsageEvents.tenantId, tenantId),
          gte(aiUsageEvents.createdAt, since),
        ),
      );

    return {
      costMicros: Number(row?.costMicros ?? 0),
      requestCount: Number(row?.requestCount ?? 0),
    };
  },

  /**
   * Sum tenant spend since a date
   *
   * Workspace rollup for billing UI.
   *
   * @param tenantId - Tenant id
   * @param since - Inclusive lower bound on created_at
   * @returns Total cost in micros and request count
   */
  async sumTenantSpendSince(tenantId: string, since: Date): Promise<UsageTotals> {
    const [row] = await db
      .select({
        costMicros: sql<string>`coalesce(sum(${aiUsageEvents.costMicros}), 0)`,
        requestCount: sql<string>`count(*)`,
      })
      .from(aiUsageEvents)
      .where(and(eq(aiUsageEvents.tenantId, tenantId), gte(aiUsageEvents.createdAt, since)));

    return {
      costMicros: Number(row?.costMicros ?? 0),
      requestCount: Number(row?.requestCount ?? 0),
    };
  },

  /**
   * Sum spend per user in a tenant since a date
   *
   * Only users with at least one usage event appear. Join with members in the
   * service to include seats with zero spend.
   *
   * @param tenantId - Tenant id
   * @param since - Inclusive lower bound on created_at
   * @returns Per-user totals
   */
  async sumSpendByUserSince(tenantId: string, since: Date): Promise<UserUsageTotals[]> {
    const rows = await db
      .select({
        userId: aiUsageEvents.userId,
        costMicros: sql<string>`coalesce(sum(${aiUsageEvents.costMicros}), 0)`,
        requestCount: sql<string>`count(*)`,
      })
      .from(aiUsageEvents)
      .where(and(eq(aiUsageEvents.tenantId, tenantId), gte(aiUsageEvents.createdAt, since)))
      .groupBy(aiUsageEvents.userId);

    return rows.map((row) => ({
      userId: row.userId,
      costMicros: Number(row.costMicros ?? 0),
      requestCount: Number(row.requestCount ?? 0),
    }));
  },

  /**
   * Insert a usage event
   *
   * Append-only; no row returned.
   *
   * @param values - New usage event fields
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
