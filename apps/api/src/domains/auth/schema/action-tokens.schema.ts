/**
 * Action tokens
 *
 * Single-use tokens sent by email (verification and password reset).
 */
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

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

/** Purpose of an email action token. */
export type ActionTokenPurpose = (typeof actionTokens.purpose.enumValues)[number];
