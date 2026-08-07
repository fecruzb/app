import { z } from "zod";
import { defineTool } from "@/agent/tool";
import { toArticleToolSummary } from "../dto";
import { articleRepository } from "../repository";

/**
 * List articles
 *
 * `list_articles`
 *
 * Lists the tenant's articles, optionally filtered by a title/body substring.
 *
 * @returns Array of `{ id, title, coverUrl, updatedAt }`
 */
export const listArticlesTool = defineTool({
  name: "list_articles",
  description:
    "Lists the tenant's articles (id, title, cover url, updated at). Use search to filter by a title or body substring.",
  inputSchema: { search: z.string().optional() },
  execute: async (ctx, { search }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId } = ctx;

    // -- Processing ------------------------------------------------------------
    const rows = await articleRepository.list(tenantId, search);

    // -- Output ----------------------------------------------------------------
    return rows.map((r) => toArticleToolSummary(r, { includeCover: true, includeUpdatedAt: true }));
  },
});
