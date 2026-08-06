// All AI usage data access. Spend is scoped per user (global, across tenants).
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { aiUsageEvents } from "./schema";

export type UsageTotals = { costMicros: number; requestCount: number };

export const usageRepository = {
  /** Aggregated spend for a user since a point in time — served by the (user, created_at) index. */
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
