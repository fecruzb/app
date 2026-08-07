import { z } from "zod";
import { articleInputSchema } from "@app/shared";
import { defineTool } from "@/agent/tool";
import { articleRepository } from "../repository";

/**
 * Update an article
 *
 * `update_article`
 *
 * Updates an article's title and/or Markdown body in the current tenant.
 *
 * @returns `{ id, title }` of the updated article
 */
export const updateArticleTool = defineTool({
  name: "update_article",
  description:
    "Updates an article's title and/or Markdown body. Read it first with get_article if you only want to change one field.",
  inputSchema: {
    id: z.string().uuid(),
    title: articleInputSchema.shape.title.optional(),
    body: articleInputSchema.shape.body.optional(),
  },
  summarize: (args) => `Article updated: ${args.title ?? args.id}`,
  execute: async (ctx, { id, title, body }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const current = await articleRepository.find(tenantId, id);
    if (!current) throw new Error("Article not found — check the id with list_articles");

    const article = await articleRepository.update(tenantId, id, {
      title: title ?? current.article.title,
      body: body ?? current.article.body,
    });
    if (!article) throw new Error("Article not found — check the id with list_articles");

    // -- Output ----------------------------------------------------------------
    return { id: article.id, title: article.title };
  },
});
