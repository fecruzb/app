/**
 * Generate article cover tool
 *
 * Lives in `agent/`, not `domains/article/tools/`: it is the one tool that
 * calls OpenAI directly. Domains stay transport-neutral — OpenAI belongs only
 * in `integrations/`, orchestrated from here (see agent-tools.mdc).
 */
import { generateArticleCoverSchema } from "@app/shared";
import { z } from "zod";
import { generateAndAttachArticleCover } from "../generate-article-cover";
import { defineTool } from "../tool";

/**
 * Generate article cover
 *
 * `generate_article_cover`
 *
 * Generates a cover image from a text description and attaches it to an article.
 *
 * @returns `{ id, coverUrl }` of the article
 */
export const generateArticleCoverTool = defineTool({
  name: "generate_article_cover",
  description:
    "Generates a cover image from a text description and sets it on an existing article. Prefer a prompt derived from the article title and body. Returns the article id and cover url.",
  inputSchema: {
    articleId: z.string().uuid(),
    prompt: generateArticleCoverSchema.shape.prompt,
  },
  progress: (args) => `Generating cover${args.prompt ? `: ${args.prompt.slice(0, 60)}` : "…"}`,
  summarize: (args) => `Cover generated${args.prompt ? `: ${args.prompt.slice(0, 60)}` : ""}`,
  execute: async (ctx, { articleId, prompt }) => {
    // -- Input -----------------------------------------------------------------
    const { tenantId, userId } = ctx;

    // -- Processing ------------------------------------------------------------
    const result = await generateAndAttachArticleCover({
      tenantId,
      userId,
      articleId,
      prompt,
    });

    // -- Output ----------------------------------------------------------------
    return result;
  },
});
