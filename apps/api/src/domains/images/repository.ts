/**
 * Image repository
 *
 * Owns every SQL touch of the `images` table. Reads join the author name from
 * `users`; writes use `.returning()`. Every method takes `tenantId` and
 * filters by it. Queries are written inline. Returns rows / join shapes —
 * map to DTOs in `dto.ts`.
 */
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/domains/auth/schema";
import { images, type Image } from "./schema";

/** Image row plus the author's display name from the join. */
export type ImageWithAuthor = { image: Image; authorName: string | null };

export const imageRepository = {
  /**
   * List images
   *
   * Newest first for the tenant.
   *
   * @param tenantId - Tenant that owns the images
   * @returns Images with author names, newest first
   */
  async list(tenantId: string): Promise<ImageWithAuthor[]> {
    return db
      .select({ image: images, authorName: users.name })
      .from(images)
      .leftJoin(users, eq(users.id, images.authorId))
      .where(eq(images.tenantId, tenantId))
      .orderBy(desc(images.createdAt));
  },

  /**
   * Find an image
   *
   * By id within the tenant, or null if missing / wrong tenant.
   *
   * @param tenantId - Tenant that owns the image
   * @param imageId - Image id
   * @returns Image with author name, or null
   */
  async find(tenantId: string, imageId: string): Promise<ImageWithAuthor | null> {
    const [row] = await db
      .select({ image: images, authorName: users.name })
      .from(images)
      .leftJoin(users, eq(users.id, images.authorId))
      .where(and(eq(images.id, imageId), eq(images.tenantId, tenantId)));
    return row ?? null;
  },

  /**
   * Insert an image
   *
   * Returns the new row.
   *
   * @param values - New image fields
   * @param values.tenantId - Tenant that owns the image
   * @param values.authorId - Author user id, or null
   * @param values.path - Storage path / key
   * @param values.contentType - MIME type
   * @param values.sizeBytes - File size in bytes
   * @returns The inserted image row
   */
  async insert(values: {
    tenantId: string;
    authorId: string | null;
    path: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<Image> {
    const [image] = await db.insert(images).values(values).returning();
    return image;
  },

  /**
   * Delete an image
   *
   * Returns the removed row, or null if it wasn't there.
   *
   * @param tenantId - Tenant that owns the image
   * @param imageId - Image id
   * @returns The deleted image row, or null
   */
  async delete(tenantId: string, imageId: string): Promise<Image | null> {
    const [image] = await db
      .delete(images)
      .where(and(eq(images.id, imageId), eq(images.tenantId, tenantId)))
      .returning();
    return image ?? null;
  },
};
