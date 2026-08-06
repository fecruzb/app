/**
 * Image DTOs
 *
 * Maps image repository shapes to the shared image DTO.
 */
import type { ImageDto } from "@app/shared";
import type { ImageWithAuthor } from "./repository";

/**
 * To image DTO
 *
 * Public `url` is the `/media…` path served by the API.
 *
 * @param row - Image row with author display name from the join
 * @returns Shared image DTO
 */
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
