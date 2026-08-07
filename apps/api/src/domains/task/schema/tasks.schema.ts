/**
 * Tasks
 *
 * One row per task. Scoped to a tenant; optional author (set null on user delete).
 */
import { boolean, index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns";
import { users } from "@/domains/auth/schema";
import { tenants } from "@/domains/tenant/schema";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    completed: boolean("completed").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("tasks_tenant_idx").on(t.tenantId)],
);

/** Selected task row. */
export type Task = typeof tasks.$inferSelect;
