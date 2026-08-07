import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toArticleDto } from "../dto";
import { articleRepository } from "../repository";

/**
 * Get an article
 *
 * `GET /api/tenants/:tenantId/articles/:articleId`
 *
 * Loads a single article by id within the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the article DTO
 */
export async function getArticle(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const articleId = uuidParam(c, "articleId");

  // -- Processing ------------------------------------------------------------
  const row = await articleRepository.find(tenantId, articleId);
  if (!row) throw new HttpError(404, "Article not found");

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto(row));
}
