import { z } from "zod";

export const articleInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().max(100_000).default(""),
});

/** Toggle public visibility without rewriting title/body. */
export const articlePublishSchema = z.object({
  published: z.boolean(),
});

export type ArticleDto = {
  id: string;
  title: string;
  body: string;
  /** Absolute path the browser can load, or null when there is no cover. */
  coverUrl: string | null;
  coverContentType: string | null;
  coverSizeBytes: number | null;
  /** ISO timestamp when published, or null while private. */
  publishedAt: string | null;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Card row on the public catalog (no body). */
export type PublicArticleSummaryDto = {
  id: string;
  title: string;
  coverUrl: string | null;
  authorName: string | null;
  tenantName: string;
  tenantSlug: string;
  publishedAt: string;
};

/** Full public article page. */
export type PublicArticleDto = PublicArticleSummaryDto & {
  body: string;
};
