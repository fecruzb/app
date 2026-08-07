/**
 * Users
 *
 * Global accounts (not tenant-scoped). Password is stored as a hash only.
 * `isPlatformAdmin` is orthogonal to tenant roles — grants the /admin area.
 */
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  isPlatformAdmin: boolean("is_platform_admin").notNull().default(false),
  ...timestamps,
});

/** Selected user row. */
export type User = typeof users.$inferSelect;
