import { articleInputSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toArticleDto } from "../dto";
import { articleRepository } from "../repository";

/**
 * Update an article
 *
 * `PATCH /api/tenants/:tenantId/articles/:articleId`
 *
 * Updates title and Markdown body for an article in the current tenant.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the updated article DTO
 */
export async function updateArticle(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, articleInputSchema);
  const tenantId = c.get("tenant").id;
  const articleId = uuidParam(c, "articleId");

  // -- Processing ------------------------------------------------------------
  const current = await articleRepository.find(tenantId, articleId);
  if (!current) throw new HttpError(404, "Article not found");

  await articleRepository.update(tenantId, articleId, {
    title: data.title,
    body: data.body,
  });
  const row = await articleRepository.find(tenantId, articleId);

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto(row!));
}
