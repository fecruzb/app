import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { removeMedia } from "../media";
import { imageRepository } from "../repository";

/**
 * Delete an image
 *
 * `DELETE /api/tenants/:tenantId/images/:imageId`
 *
 * Removes the image row for the current tenant and deletes the stored media file.
 *
 * @param c - Authenticated tenant request context
 * @returns 200 with `{ ok: true }`
 */
export async function deleteImage(c: AppContext) {
  // -- Input -----------------------------------------------------------------
  const tenantId = c.get("tenant").id;
  const imageId = uuidParam(c, "imageId");

  // -- Processing ------------------------------------------------------------
  const image = await imageRepository.delete(tenantId, imageId);
  if (!image) throw new HttpError(404, "Image not found");
  await removeMedia(image.path);

  // -- Output ----------------------------------------------------------------
  return c.json({ ok: true });
}
