/**
 * Sessions
 *
 * Opaque session tokens. Only the hash is stored; the raw value lives in the
 * httpOnly cookie.
 */
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
