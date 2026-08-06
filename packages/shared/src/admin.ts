import { z } from "zod";

/** URL-safe tenant slug (matches slugify rules). */
export const tenantSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

// -- schemas -------------------------------------------------------------------

export const updateAdminUserSchema = z.object({
  isPlatformAdmin: z.boolean(),
});

export const updateAdminTenantSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    slug: tenantSlugSchema.optional(),
  })
  .refine((data) => data.name !== undefined || data.slug !== undefined, {
    message: "Provide name and/or slug",
  });

export const createPlatformInviteSchema = z.object({
  email: z.email().toLowerCase(),
});

export const acceptPlatformInviteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(200),
});

// -- DTOs ----------------------------------------------------------------------

export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  isPlatformAdmin: boolean;
  tenantCount: number;
  createdAt: string;
};

export type AdminTenantDto = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  createdAt: string;
};

export type AdminPlatformInviteDto = {
  id: string;
  email: string;
  invitedByName: string | null;
  createdAt: string;
  expiresAt: string;
};

export type PublicPlatformInviteDto = {
  email: string;
  inviterName: string | null;
  userExists: boolean;
};
