import { articleInputSchema } from "@app/shared";
import { parseBody } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toArticleDto } from "../dto";
import { articleRepository } from "../repository";

/**
 * Create an article
 *
 * `POST /api/tenants/:tenantId/articles`
 *
 * Inserts an article for the current tenant, attributed to the authenticated
 * user. Cover is set later via upload or the agent.
 *
 * @param c - Authenticated tenant request context
 * @returns 201 with the created article DTO
 */
export async function createArticle(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const data = await parseBody(c, articleInputSchema);
  const tenant = c.get("tenant");
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const article = await articleRepository.insert({
    tenantId: tenant.id,
    authorId: user.id,
    title: data.title,
    body: data.body,
  });

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto({ article, authorName: user.name }), 201);
}
