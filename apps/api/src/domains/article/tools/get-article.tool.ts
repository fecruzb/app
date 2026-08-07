import { z } from "zod";
import { defineTool, ToolError } from "@/agent/tool";
import { toArticleToolSummary } from "../dto";
import { articleRepository } from "../repository";

/**
 * Get an article
 *
 * `get_article`
 *
 * Reads an article's title, Markdown body, and cover by id in the current tenant.
 *
 * @returns `{ id, title, body, coverUrl }` of the article
 */
export const getArticleTool = defineTool({
  name: "get_article",
  description: "Reads an article (title, Markdown body, cover url) by id.",
  inputSchema: { id: z.string().uuid() },
  execute: async (ctx, { id }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const row = await articleRepository.find(tenantId, id);
    if (!row) throw new ToolError("Article not found — check the id with list_articles");

    // -- Output ----------------------------------------------------------------
    return toArticleToolSummary(row, { includeBody: true, includeCover: true });
  },
});
