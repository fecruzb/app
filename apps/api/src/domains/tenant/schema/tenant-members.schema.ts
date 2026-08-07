/**
 * Tenant members
 *
 * User membership in a tenant with a role. Composite primary key.
 */
import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { tenantRoles } from "@app/shared";
import { users } from "@/domains/auth/schema";
import { tenants } from "./tenants.schema";

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

/** Selected membership row. */
export type TenantMember = typeof tenantMembers.$inferSelect;
