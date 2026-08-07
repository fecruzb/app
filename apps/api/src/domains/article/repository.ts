/**
 * Article repository
 *
 * Owns every SQL touch of the `articles` table. Tenant-scoped CRUD filters by
 * `tenantId`. Public catalog methods intentionally cross tenants — only rows
 * with `publishedAt` set are returned.
 */
import { and, desc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/domains/auth/schema";
import { tenants } from "@/domains/tenant/schema";
import { articles, type Article } from "./schema";

/** Article row plus the author's display name from the join. */
export type ArticleWithAuthor = { article: Article; authorName: string | null };

/** Published article with author + tenant for the public catalog. */
export type PublishedArticleRow = {
  article: Article;
  authorName: string | null;
  tenantName: string;
  tenantSlug: string;
};

export const articleRepository = {
  /**
   * List articles
   *
   * Newest first; optional case-insensitive title/body search.
   *
   * @param tenantId - Tenant that owns the articles
   * @param search - Optional case-insensitive title/body filter
   * @returns Articles with author names, newest first
   */
  async list(tenantId: string, search?: string): Promise<ArticleWithAuthor[]> {
    const where = search
      ? and(
          eq(articles.tenantId, tenantId),
          or(ilike(articles.title, `%${search}%`), ilike(articles.body, `%${search}%`)),
        )
      : eq(articles.tenantId, tenantId);
    return db
      .select({ article: articles, authorName: users.name })
      .from(articles)
      .leftJoin(users, eq(users.id, articles.authorId))
      .where(where)
      .orderBy(desc(articles.createdAt));
  },

  /**
   * Find an article
   *
   * By id within the tenant, or null if missing / wrong tenant.
   *
   * @param tenantId - Tenant that owns the article
   * @param articleId - Article id
   * @returns Article with author name, or null
   */
  async find(tenantId: string, articleId: string): Promise<ArticleWithAuthor | null> {
    const [row] = await db
      .select({ article: articles, authorName: users.name })
      .from(articles)
      .leftJoin(users, eq(users.id, articles.authorId))
      .where(and(eq(articles.id, articleId), eq(articles.tenantId, tenantId)));
    return row ?? null;
  },

  /**
   * List published articles
   *
   * Cross-tenant public catalog, newest publish first.
   *
   * @returns Published articles with author and tenant
   */
  async listPublished(): Promise<PublishedArticleRow[]> {
    return db
      .select({
        article: articles,
        authorName: users.name,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
      })
      .from(articles)
      .innerJoin(tenants, eq(tenants.id, articles.tenantId))
      .leftJoin(users, eq(users.id, articles.authorId))
      .where(isNotNull(articles.publishedAt))
      .orderBy(desc(articles.publishedAt));
  },

  /**
   * Find a published article
   *
   * By id, only if currently published.
   *
   * @param articleId - Article id
   * @returns Published article with author and tenant, or null
   */
  async findPublished(articleId: string): Promise<PublishedArticleRow | null> {
    const [row] = await db
      .select({
        article: articles,
        authorName: users.name,
        tenantName: tenants.name,
        tenantSlug: tenants.slug,
      })
      .from(articles)
      .innerJoin(tenants, eq(tenants.id, articles.tenantId))
      .leftJoin(users, eq(users.id, articles.authorId))
      .where(and(eq(articles.id, articleId), isNotNull(articles.publishedAt)));
    return row ?? null;
  },

  /**
   * Insert an article
   *
   * Returns the new row.
   *
   * @param values - New article fields
   * @returns The inserted article row
   */
  async insert(values: {
    tenantId: string;
    authorId: string | null;
    title: string;
    body: string;
  }): Promise<Article> {
    const [article] = await db.insert(articles).values(values).returning();
    return article;
  },

  /**
   * Update an article
   *
   * Patches title and body; null if missing / wrong tenant.
   *
   * @param tenantId - Tenant that owns the article
   * @param articleId - Article id
   * @param values - Fields to patch
   * @returns The updated article row, or null
   */
  async update(
    tenantId: string,
    articleId: string,
    values: { title: string; body: string },
  ): Promise<Article | null> {
    const [article] = await db
      .update(articles)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(articles.id, articleId), eq(articles.tenantId, tenantId)))
      .returning();
    return article ?? null;
  },

  /**
   * Set publish state
   *
   * Sets `publishedAt` to now (or keeps the existing stamp) when publishing;
   * clears it when unpublishing.
   *
   * @param tenantId - Tenant that owns the article
   * @param articleId - Article id
   * @param published - Whether the article should be public
   * @returns The updated article row, or null
   */
  async setPublished(
    tenantId: string,
    articleId: string,
    published: boolean,
  ): Promise<Article | null> {
    const [article] = await db
      .update(articles)
      .set({
        publishedAt: published ? sql`coalesce(${articles.publishedAt}, now())` : null,
        updatedAt: new Date(),
      })
      .where(and(eq(articles.id, articleId), eq(articles.tenantId, tenantId)))
      .returning();
    return article ?? null;
  },

  /**
   * Update article cover
   *
   * Sets or clears cover metadata; null if missing / wrong tenant.
   *
   * @param tenantId - Tenant that owns the article
   * @param articleId - Article id
   * @param values - Cover fields (all null to clear)
   * @returns The updated article row, or null
   */
  async updateCover(
    tenantId: string,
    articleId: string,
    values: {
      coverPath: string | null;
      coverContentType: string | null;
      coverSizeBytes: number | null;
    },
  ): Promise<Article | null> {
    const [article] = await db
      .update(articles)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(articles.id, articleId), eq(articles.tenantId, tenantId)))
      .returning();
    return article ?? null;
  },

  /**
   * Delete an article
   *
   * Returns the removed row, or null if it wasn't there.
   *
   * @param tenantId - Tenant that owns the article
   * @param articleId - Article id
   * @returns The deleted article row, or null
   */
  async delete(tenantId: string, articleId: string): Promise<Article | null> {
    const [article] = await db
      .delete(articles)
      .where(and(eq(articles.id, articleId), eq(articles.tenantId, tenantId)))
      .returning();
    return article ?? null;
  },
};
