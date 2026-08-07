import { articlePublishSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toArticleDto } from "../dto";
import { articleRepository } from "../repository";

/**
 * Publish or unpublish an article
 *
 * `POST /api/tenants/:tenantId/articles/:articleId/publish`
 *
 * Sets or clears `publishedAt` so the piece appears on (or leaves) the public
 * `/articles` catalog.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the updated article DTO
 */
export async function publishArticle(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, articlePublishSchema);
  const tenantId = c.get("tenant").id;
  const articleId = uuidParam(c, "articleId");

  // -- Processing ------------------------------------------------------------
  const current = await articleRepository.find(tenantId, articleId);
  if (!current) throw new HttpError(404, "Article not found");

  await articleRepository.setPublished(tenantId, articleId, data.published);
  const row = await articleRepository.find(tenantId, articleId);

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto(row!));
}
