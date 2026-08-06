/**
 * Usage schema
 *
 * AI spend ledger: one row per assistant request (not per model round).
 */
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/domains/auth/schema";
import { tenants } from "@/domains/tenant/schema";

/**
 * AI usage events
 *
 * Append-only spend records. Budget is global per user; `tenantId` is audit only.
 */
export const aiUsageEvents = pgTable(
  "ai_usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * Tenant context
     *
     * Audit only — the monthly budget is global per user, across tenants.
     */
    tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "set null" }),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull(),
    cachedInputTokens: integer("cached_input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull(),
    rounds: integer("rounds").notNull(),
    /**
     * Cost in micro-dollars
     *
     * USD × 1_000_000 — integers only, never floats.
     */
    costMicros: integer("cost_micros").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_usage_events_user_created_idx").on(t.userId, t.createdAt)],
);

/** Selected usage event row. */
export type AiUsageEvent = typeof aiUsageEvents.$inferSelect;
