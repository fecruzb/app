/**
 * Tenant schema
 *
 * Workspaces, memberships, and pending invites.
 */
import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { planIds, tenantRoles } from "@app/shared";
import { timestamps } from "@/db/columns";
import { users } from "@/domains/auth/schema";

/**
 * Tenants
 *
 * One workspace per row. Slug is unique and used in URLs. `planId` selects
 * seat/AI entitlements from the code catalog (billing domain).
 */
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  planId: text("plan_id", { enum: planIds }).notNull().default("free"),
  ...timestamps,
});

/**
 * Tenant members
 *
 * User membership in a tenant with a role. Composite primary key.
 */
export const tenantMembers = pgTable(
  "tenant_members",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: tenantRoles }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.tenantId, t.userId] })],
);

/**
 * Tenant invites
 *
 * Pending invites by email. Token is stored hashed; expires after a TTL.
 */
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

/** Selected tenant row. */
export type Tenant = typeof tenants.$inferSelect;

/** Selected membership row. */
export type TenantMember = typeof tenantMembers.$inferSelect;

/** Selected invite row. */
export type TenantInvite = typeof tenantInvites.$inferSelect;
