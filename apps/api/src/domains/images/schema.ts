/**
 * Image schema
 *
 * Tenant-scoped image metadata. Bytes live in object storage; this table holds
 * the path and provenance.
 */
import { index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns";
import { users } from "@/domains/auth/schema";
import { tenants } from "@/domains/tenant/schema";

/**
 * Images
 *
 * One row per stored image. Scoped to a tenant; optional author.
 */
export const images = pgTable(
  "images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    /**
     * Storage path
     *
     * Relative key, e.g. `"<tenantId>/uploads/<uuid>.webp"`.
     */
    path: text("path").notNull(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    ...timestamps,
  },
  (t) => [index("images_tenant_idx").on(t.tenantId)],
);

/** Selected image row. */
export type Image = typeof images.$inferSelect;
