import type { AppContext } from "@/context";
import { toPublicArticleSummary } from "../dto";
import { articleRepository } from "../repository";

/**
 * List published articles
 *
 * `GET /api/articles`
 *
 * Anonymous catalog of articles published across all tenants.
 *
 * @param c - Request context
 * @returns 200 with an array of public article summaries
 */
export async function listPublicArticles(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  // (none — public catalog)

  // -- Processing ------------------------------------------------------------
  const rows = await articleRepository.listPublished();

  // -- Output ----------------------------------------------------------------
  return c.json(rows.map(toPublicArticleSummary));
}
