import { z } from "zod";
import { defineTool, ToolError } from "@/agent/tool";
import { articleRepository } from "../repository";

/**
 * Publish or unpublish an article
 *
 * `publish_article`
 *
 * Sets or clears `publishedAt` so the piece appears on (or leaves) the public
 * `/articles` catalog.
 *
 * @returns `{ id, title, publishedAt }` of the updated article
 */
export const publishArticleTool = defineTool({
  name: "publish_article",
  description: "Publishes or unpublishes an article by id for the public catalog.",
  inputSchema: {
    id: z.string().uuid(),
    published: z.boolean(),
  },
  progress: (args) => (args.published ? "Publishing article…" : "Unpublishing article…"),
  summarize: (args) => (args.published ? "Article published" : "Article unpublished"),
  execute: async (ctx, { id, published }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const current = await articleRepository.find(tenantId, id);
    if (!current) throw new ToolError("Article not found — check the id with list_articles");

    const article = await articleRepository.setPublished(tenantId, id, published);
    if (!article) throw new ToolError("Article not found — check the id with list_articles");

    // -- Output ----------------------------------------------------------------
    return {
      id: article.id,
      title: article.title,
      publishedAt: article.publishedAt?.toISOString() ?? null,
    };
  },
});
