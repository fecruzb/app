/**
 * API keys
 *
 * Programmatic access (e.g. MCP). Each key belongs to a user and is scoped to
 * one tenant. Only the hash is stored; `prefix` is the visible head in the UI.
 * HTTP management is under `domains/account` — this table stays in auth because
 * keys are credentials (same home as sessions). `expiresAt` is optional: null
 * means the key never expires; a past value makes it stop resolving.
 */
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenants } from "@/domains/tenant/schema";
import { users } from "./users.schema";

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  prefix: text("prefix").notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Selected API key row. */
export type ApiKey = typeof apiKeys.$inferSelect;
