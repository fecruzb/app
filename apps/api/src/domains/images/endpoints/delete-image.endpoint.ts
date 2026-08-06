import { HttpError, uuidParam } from "@/lib/errors";
import type { AppContext } from "@/context";
import { removeMedia } from "../media";
import { imageRepository } from "../repository";

export async function deleteImage(c: AppContext) {
  const image = await imageRepository.delete(c.get("tenant").id, uuidParam(c, "imageId"));
  if (!image) throw new HttpError(404, "Image not found");
  await removeMedia(image.path);
  return c.json({ ok: true });
}
