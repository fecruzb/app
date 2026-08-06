import { HttpError } from "@/lib/errors";
import type { AppContext } from "@/context";
import { toImageDto } from "../dto";
import { newUploadKey, writeMedia } from "../media";
import { imageRepository } from "../repository";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

/** Multipart upload — `parseBody` only handles JSON, so the form is read directly. */
export async function uploadImage(c: AppContext) {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new HttpError(400, "Send the image in the 'file' field");
  }
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) throw new HttpError(400, "Unsupported format — use PNG, JPG or WebP");
  if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, "Image too large (max 12 MB)");

  const tenantId = c.get("tenant").id;
  const data = Buffer.from(await file.arrayBuffer());
  const { path, sizeBytes } = await writeMedia(newUploadKey(tenantId, ext), data);

  const image = await imageRepository.insert({
    tenantId,
    authorId: c.get("user").id,
    path,
    contentType: "image/webp",
    sizeBytes,
  });
  return c.json(toImageDto({ image, authorName: c.get("user").name }), 201);
}
