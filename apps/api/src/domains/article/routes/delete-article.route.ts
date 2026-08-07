import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { removeMedia } from "../media";
import { articleRepository } from "../repository";

/**
 * Delete an article
 *
 * `DELETE /api/tenants/:tenantId/articles/:articleId`
 *
 * Removes an article and its cover media by id within the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ ok: true }`
 */
export async function deleteArticle(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const articleId = uuidParam(c, "articleId");

  // -- Processing ------------------------------------------------------------
  const article = await articleRepository.delete(tenantId, articleId);
  if (!article) throw new HttpError(404, "Article not found");
  if (article.coverPath) await removeMedia(article.coverPath);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
