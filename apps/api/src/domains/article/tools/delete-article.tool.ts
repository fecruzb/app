import { z } from "zod";
import { defineTool, ToolError } from "@/agent/tool";
import { removeMedia } from "../media";
import { articleRepository } from "../repository";

/**
 * Delete an article
 *
 * `delete_article`
 *
 * Deletes an article by id in the current tenant (and its cover media).
 *
 * @returns `{ ok: true, title }` of the deleted article
 */
export const deleteArticleTool = defineTool({
  name: "delete_article",
  description: "Deletes an article by id. Only use when the user explicitly asks.",
  inputSchema: { id: z.string().uuid() },
  progress: () => "Deleting article…",
  summarize: () => "Article deleted",
  execute: async (ctx, { id }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const article = await articleRepository.delete(tenantId, id);
    if (!article) throw new ToolError("Article not found — check the id with list_articles");
    if (article.coverPath) await removeMedia(article.coverPath);

    // -- Output ----------------------------------------------------------------
    return { ok: true, title: article.title };
  },
});
