/**
 * Tenants
 *
 * One workspace per row. Slug is unique and used in URLs. `planId` selects
 * seat/AI entitlements from the code catalog (billing domain).
 */
import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { planIds } from "@app/shared";
import { timestamps } from "@/db/columns";

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  planId: text("plan_id", { enum: planIds }).notNull().default("free"),
  ...timestamps,
});

/** Selected tenant row. */
export type Tenant = typeof tenants.$inferSelect;
