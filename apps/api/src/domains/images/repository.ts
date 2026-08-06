// All image row access goes through here. Every query filters by tenantId —
// that's how multi-tenant isolation holds.
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/domains/auth/schema";
import { images, type Image } from "./schema";

export type ImageWithAuthor = { image: Image; authorName: string | null };

const baseQuery = () =>
  db
    .select({ image: images, authorName: users.name })
    .from(images)
    .leftJoin(users, eq(users.id, images.authorId));

export const imageRepository = {
  async list(tenantId: string): Promise<ImageWithAuthor[]> {
    return baseQuery().where(eq(images.tenantId, tenantId)).orderBy(desc(images.createdAt));
  },

  async find(tenantId: string, imageId: string): Promise<ImageWithAuthor | null> {
    const [row] = await baseQuery().where(
      and(eq(images.id, imageId), eq(images.tenantId, tenantId)),
    );
    return row ?? null;
  },

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

  async delete(tenantId: string, imageId: string): Promise<Image | null> {
    const [image] = await db
      .delete(images)
      .where(and(eq(images.id, imageId), eq(images.tenantId, tenantId)))
      .returning();
    return image ?? null;
  },
};
