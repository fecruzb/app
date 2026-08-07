import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toPublicArticleDto } from "../dto";
import { articleRepository } from "../repository";

/**
 * Get a published article
 *
 * `GET /api/articles/:articleId`
 *
 * Anonymous read of a single published article. Unpublished ids return 404.
 *
 * @param c - Request context
 * @returns 200 with the public article DTO
 */
export async function getPublicArticle(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const articleId = uuidParam(c, "articleId");

  // -- Processing ------------------------------------------------------------
  const row = await articleRepository.findPublished(articleId);
  if (!row) throw new HttpError(404, "Article not found");

  // -- Output ----------------------------------------------------------------
  return c.json(toPublicArticleDto(row));
}
