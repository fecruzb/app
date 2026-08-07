import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_BYTES } from "../constants";
import { toArticleDto } from "../dto";
import { articleRepository } from "../repository";
import { newUploadKey, removeMedia, writeMedia } from "../utils";

/**
 * Upload article cover
 *
 * `POST /api/tenants/:tenantId/articles/:articleId/cover`
 *
 * Accepts a multipart `file` field (PNG, JPG, or WebP), stores media, and
 * replaces any existing cover. Reads the form directly because `parseBody`
 * only handles JSON.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with the updated article DTO
 */
export async function uploadArticleCover(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const articleId = uuidParam(c, "articleId");
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new HttpError(400, "Send the image in the 'file' field");
  }
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) throw new HttpError(400, "Unsupported format — use PNG, JPG or WebP");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Image too large (max 12 MB)");

  // -- Processing ------------------------------------------------------------
  const current = await articleRepository.find(tenantId, articleId);
  if (!current) throw new HttpError(404, "Article not found");

  const data = Buffer.from(await file.arrayBuffer());
  const { path, sizeBytes } = await writeMedia(newUploadKey(tenantId, ext), data);

  if (current.article.coverPath) await removeMedia(current.article.coverPath);

  await articleRepository.updateCover(tenantId, articleId, {
    coverPath: path,
    coverContentType: "image/webp",
    coverSizeBytes: sizeBytes,
  });
  const row = await articleRepository.find(tenantId, articleId);

  // -- Output ----------------------------------------------------------------
  return c.json(toArticleDto(row!));
}
