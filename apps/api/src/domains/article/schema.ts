/**
 * Article schema
 *
 * Tenant-scoped articles: title, Markdown body, optional cover, and an optional
 * `publishedAt` that surfaces the piece on the public marketing site.
 */
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "@/db/columns";
import { users } from "@/domains/auth/schema";
import { tenants } from "@/domains/tenant/schema";

/**
 * Articles
 *
 * One row per article. Scoped to a tenant; optional author and cover.
 * `publishedAt` null = private (app only); set = listed on `/articles`.
 */
export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    /** Markdown body. */
    body: text("body").notNull().default(""),
    /**
     * Cover storage path
     *
     * Relative key, e.g. `"<tenantId>/uploads/<uuid>.webp"`, or null.
     */
    coverPath: text("cover_path"),
    coverContentType: text("cover_content_type"),
    coverSizeBytes: integer("cover_size_bytes"),
    /** When set, the article is visible on the public `/articles` catalog. */
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("articles_tenant_idx").on(t.tenantId),
    index("articles_published_idx").on(t.publishedAt),
  ],
);

/** Selected article row. */
export type Article = typeof articles.$inferSelect;
