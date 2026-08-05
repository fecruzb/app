// Recurso de exemplo — troque pelo domínio do seu produto.
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns";
import { users } from "@/domains/auth/schema";
import { tenants } from "@/domains/tenant/schema";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    ...timestamps,
  },
  (t) => [index("notes_tenant_idx").on(t.tenantId)],
);

export type Note = typeof notes.$inferSelect;
