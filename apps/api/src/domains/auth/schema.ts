/**
 * Auth schema
 *
 * Users, opaque sessions, email action tokens, and tenant-scoped API keys.
 */
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns";
import { tenants } from "@/domains/tenant/schema";

/**
 * Users
 *
 * Global accounts (not tenant-scoped). Password is stored as a hash only.
 * `isPlatformAdmin` is orthogonal to tenant roles — grants the /admin area.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
  ...timestamps,
});

/**
 * Sessions
 *
 * Opaque session tokens. Only the hash is stored; the raw value lives in the
 * httpOnly cookie.
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Action tokens
 *
 * Single-use tokens sent by email (verification and password reset).
 */
export const actionTokens = pgTable("action_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  purpose: text("purpose", { enum: ["verify_email", "reset_password"] }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * API keys
 *
 * Programmatic access (e.g. MCP). Each key belongs to a user and is scoped to
 * one tenant. Only the hash is stored; `prefix` is the visible head in the UI.
 * HTTP management is under `domains/account` — this table stays in auth because
 * keys are credentials (same home as sessions). `expiresAt` is optional: null
 * means the key never expires; a past value makes it stop resolving.
 */
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

/** Selected user row. */
export type User = typeof users.$inferSelect;

/** Selected API key row. */
export type ApiKey = typeof apiKeys.$inferSelect;

/** Purpose of an email action token. */
export type ActionTokenPurpose = (typeof actionTokens.purpose.enumValues)[number];
