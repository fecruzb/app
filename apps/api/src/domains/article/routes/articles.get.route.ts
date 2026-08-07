import type { AppContext } from "@/context";
import { toArticleDto } from "../dto";
import { articleRepository } from "../repository";

/**
 * List articles
 *
 * `GET /api/tenants/:tenantId/articles`
 *
 * Returns articles for the current tenant. Optional `?search=` filters by
 * title or body.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with an array of article DTOs
 */
export async function listArticles(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const search = c.req.query("search")?.trim() || undefined;

  // -- Processing ------------------------------------------------------------
  const rows = await articleRepository.list(tenantId, search);

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toArticleDto));
}
