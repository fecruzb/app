import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toImageDto } from "../dto";
import { newUploadKey, writeMedia } from "../media";
import { imageRepository } from "../repository";

/** Allowed upload MIME types mapped to file extensions. */
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Maximum upload size (12 MB). */
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/**
 * Upload an image
 *
 * `POST /api/tenants/:tenantId/images`
 *
 * Accepts a multipart `file` field (PNG, JPG, or WebP), stores media for the
 * current tenant, and returns the image DTO. Reads the form directly because
 * `parseBody` only handles JSON.
 *
 * @param c - Authenticated tenant request context
 * @returns 201 with the created image DTO
 */
export async function uploadImage(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new HttpError(400, "Send the image in the 'file' field");
  }
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) throw new HttpError(400, "Unsupported format — use PNG, JPG or WebP");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Image too large (max 12 MB)");

  const tenantId = c.get("tenant").id;
  const user = c.get("user");

  // -- Processing ------------------------------------------------------------
  const data = Buffer.from(await file.arrayBuffer());
  const { path, sizeBytes } = await writeMedia(newUploadKey(tenantId, ext), data);

  const image = await imageRepository.insert({
    tenantId,
    authorId: user.id,
    path,
    contentType: "image/webp",
    sizeBytes,
  });

  // -- Output ----------------------------------------------------------------
  return c.json(toImageDto({ image, authorName: user.name }), 201);
}
