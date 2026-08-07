/**
 * Tenant invites
 *
 * Pending invites by email. Token is stored hashed; expires after a TTL.
 */
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "@/domains/auth/schema";
import { tenants } from "./tenants.schema";

export const tenantInvites = pgTable("tenant_invites", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role", { enum: ["admin", "member"] }).notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedBy: uuid("invited_by").references(() => users.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Selected invite row. */
export type TenantInvite = typeof tenantInvites.$inferSelect;
