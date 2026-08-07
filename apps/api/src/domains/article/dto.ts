/**
 * Article DTOs
 *
 * Maps article repository shapes to shared article DTOs (tenant app + public).
 */
import type { ArticleDto, PublicArticleDto, PublicArticleSummaryDto } from "@app/shared";
import type { Article } from "./schema";
import type { ArticleWithAuthor, PublishedArticleRow } from "./repository";

/**
 * To article DTO
 *
 * Public `coverUrl` is the `/media…` path served by the API, or null.
 *
 * @param row - Article row with author display name from the join
 * @returns Shared article DTO
 */
export function toArticleDto({ article, authorName }: ArticleWithAuthor): ArticleDto {
  return {
    id: article.id,
    title: article.title,
    body: article.body,
    coverUrl: article.coverPath ? `/media${article.coverPath}` : null,
    coverContentType: article.coverContentType,
    coverSizeBytes: article.coverSizeBytes,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    authorId: article.authorId,
    authorName,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

/**
 * To public article summary
 *
 * Catalog card — omits the Markdown body.
 *
 * @param row - Published article with tenant
 * @returns Public summary DTO
 */
export function toPublicArticleSummary(row: PublishedArticleRow): PublicArticleSummaryDto {
  const { article, authorName, tenantName, tenantSlug } = row;
  return {
    id: article.id,
    title: article.title,
    coverUrl: article.coverPath ? `/media${article.coverPath}` : null,
    authorName,
    tenantName,
    tenantSlug,
    publishedAt: article.publishedAt!.toISOString(),
  };
}

/**
 * To public article DTO
 *
 * Full public page including Markdown body.
 *
 * @param row - Published article with tenant
 * @returns Public article DTO
 */
export function toPublicArticleDto(row: PublishedArticleRow): PublicArticleDto {
  return {
    ...toPublicArticleSummary(row),
    body: row.article.body,
  };
}

/** Slim article shape returned by agent tools (list/get). */
export type ArticleToolSummary = {
  id: string;
  title: string;
  body?: string;
  coverUrl?: string | null;
  updatedAt?: string;
};

/**
 * To article tool summary
 *
 * Compact JSON for the agent — list omits body; get includes it.
 *
 * @param row - Article row with author (author ignored)
 * @param options - Whether to include body / cover / updatedAt
 * @returns Tool summary
 */
export function toArticleToolSummary(
  { article }: ArticleWithAuthor,
  options: { includeBody?: boolean; includeCover?: boolean; includeUpdatedAt?: boolean } = {},
): ArticleToolSummary {
  const summary: ArticleToolSummary = {
    id: article.id,
    title: article.title,
  };
  if (options.includeBody) summary.body = article.body;
  if (options.includeCover) {
    summary.coverUrl = article.coverPath ? `/media${article.coverPath}` : null;
  }
  if (options.includeUpdatedAt) summary.updatedAt = article.updatedAt.toISOString();
  return summary;
}

/**
 * Cover url for a bare article row (agent generate tool).
 *
 * @param article - Article row
 * @returns `/media…` path or null
 */
export function articleCoverUrl(article: Article): string | null {
  return article.coverPath ? `/media${article.coverPath}` : null;
}
