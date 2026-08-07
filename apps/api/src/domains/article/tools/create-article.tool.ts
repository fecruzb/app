import { articleInputSchema } from "@app/shared";
import { defineTool } from "@/agent/tool";
import { articleRepository } from "../repository";

/**
 * Create an article
 *
 * `create_article`
 *
 * Creates an article in the current tenant for the acting user. Cover is set
 * separately with generate_article_cover after the article exists.
 *
 * @returns `{ id, title }` of the created article
 */
export const createArticleTool = defineTool({
  name: "create_article",
  description:
    "Creates an article with a title and Markdown body. After creating, use generate_article_cover to add a cover image from a description of the content.",
  inputSchema: {
    title: articleInputSchema.shape.title,
    body: articleInputSchema.shape.body,
  },
  summarize: (args) => `Article created: ${args.title}`,
  execute: async (ctx, { title, body }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId, userId } = ctx;

    // -- Processing ------------------------------------------------------------
    const article = await articleRepository.insert({
      tenantId,
      authorId: userId,
      title,
      body,
    });

    // -- Output ----------------------------------------------------------------
    return { id: article.id, title: article.title };
  },
});
