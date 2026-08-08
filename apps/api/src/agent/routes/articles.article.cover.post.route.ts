import { generateArticleCoverSchema } from "@app/shared";
import { HttpError, parseBody, uuidParam } from "@/lib/errors";
import { hasOpenAiKey } from "@/integrations/openai";
import type { AppContext } from "@/context";
import { toArticleDto } from "@/domains/article/dto";
import { articleRepository } from "@/domains/article/repository";
import { generateAndAttachArticleCover } from "../generate-article-cover";

/**
 * Generate article cover
 *
 * `POST /api/tenants/:tenantId/agent/articles/:articleId/cover`
 *
 * Generates a cover from the article title/body (or an optional JSON `prompt`)
 * and attaches it. Requires OpenAI to be configured.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the updated article DTO
 */
export async function generateArticleCover(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  if (!hasOpenAiKey()) throw new HttpError(503, "AI is not configured on this server");
  const tenant = c.get("tenant");
  const user = c.get("user");
  const articleId = uuidParam(c, "articleId");
  const { prompt } = await parseBody(c, generateArticleCoverSchema);

  // -- Processing ------------------------------------------------------------
  try {
    await generateAndAttachArticleCover({
      tenantId: tenant.id,
      userId: user.id,
      articleId,
      prompt,
    });
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(502, "Failed to generate cover");
  }

  const row = await articleRepository.find(tenant.id, articleId);

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto(row!));
}
