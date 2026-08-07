/**
 * Platform invites
 *
 * Pending signup invites by email. No tenant — accepting creates a personal
 * workspace. Token is stored hashed; expires after a TTL.
 */
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/domains/auth/schema";

export const platformInvites = pgTable("platform_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Selected platform invite row. */
export type PlatformInvite = typeof platformInvites.$inferSelect;
