import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toArticleDto } from "../dto";
import { removeMedia } from "../media";
import { articleRepository } from "../repository";

/**
 * Delete article cover
 *
 * `DELETE /api/tenants/:tenantId/articles/:articleId/cover`
 *
 * Removes the cover image from storage and clears cover metadata.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the updated article DTO
 */
export async function deleteArticleCover(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const articleId = uuidParam(c, "articleId");

  // -- Processing ------------------------------------------------------------
  const current = await articleRepository.find(tenantId, articleId);
  if (!current) throw new HttpError(404, "Article not found");

  if (current.article.coverPath) await removeMedia(current.article.coverPath);

  await articleRepository.updateCover(tenantId, articleId, {
    coverPath: null,
    coverContentType: null,
    coverSizeBytes: null,
  });
  const row = await articleRepository.find(tenantId, articleId);

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto(row!));
}
