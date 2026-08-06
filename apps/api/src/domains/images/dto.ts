import type { ImageDto } from "@app/shared";
import type { ImageWithAuthor } from "./repository";

export function toImageDto({ image, authorName }: ImageWithAuthor): ImageDto {
  return {
    id: image.id,
    url: `/media${image.path}`,
    contentType: image.contentType,
    sizeBytes: image.sizeBytes,
    authorId: image.authorId,
    authorName,
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString(),
  };
}
