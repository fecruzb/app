/**
 * Generate article cover
 *
 * Shared by the agent tool and the HTTP route. Calls OpenAI, stores media,
 * updates the article cover, and records usage.
 */
import { generateImage } from "@/integrations/openai";
import { env } from "@/lib/env";
import { HttpError } from "@/lib/errors";
import { articleCoverUrl } from "@/domains/article/dto";
import { newUploadKey, removeMedia, writeMedia } from "@/domains/article/utils";
import { articleRepository } from "@/domains/article/repository";
import { usageRepository } from "@/domains/usage/repository";
import { assertAiBudget } from "@/domains/billing/service";

const LANDSCAPE = "1536x1024" as const;

/**
 * Build a cover prompt from article title and body when the caller omits one.
 *
 * @param title - Article title
 * @param body - Markdown body
 * @returns Prompt string for image generation
 */
export function coverPromptFromArticle(title: string, body: string): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
  const subject = plain || title;
  return `Editorial cover illustration for an article titled "${title}". Mood and subject: ${subject}. No text or typography in the image.`;
}

/**
 * Generate and attach a cover image to an article.
 *
 * @param opts - Tenant, actor, article, and optional prompt
 * @returns Updated article id and cover url
 */
export async function generateAndAttachArticleCover(opts: {
  tenantId: string;
  userId: string | null;
  articleId: string;
  prompt?: string;
}): Promise<{ id: string; coverUrl: string | null }> {
  const current = await articleRepository.find(opts.tenantId, opts.articleId);
  if (!current) throw new HttpError(404, "Article not found");

  if (opts.userId) await assertAiBudget(opts.userId, opts.tenantId);

  const prompt =
    opts.prompt?.trim() || coverPromptFromArticle(current.article.title, current.article.body);

  const { data, usage } = await generateImage({
    model: env.imageModel,
    prompt,
    size: LANDSCAPE,
  });

  const { path, sizeBytes } = await writeMedia(newUploadKey(opts.tenantId, "png"), data);

  if (current.article.coverPath) await removeMedia(current.article.coverPath);

  const article = await articleRepository.updateCover(opts.tenantId, opts.articleId, {
    coverPath: path,
    coverContentType: "image/webp",
    coverSizeBytes: sizeBytes,
  });
  if (!article) throw new HttpError(404, "Article not found");

  if (opts.userId) {
    await usageRepository.insert({
      userId: opts.userId,
      tenantId: opts.tenantId,
      model: usage.model,
      inputTokens: usage.inputTokens,
      cachedInputTokens: usage.cachedInputTokens,
      outputTokens: usage.outputTokens,
      rounds: usage.rounds,
      costMicros: usage.costMicros,
    });
  }

  return { id: article.id, coverUrl: articleCoverUrl(article) };
}
