import { z } from "zod";
import { planIdSchema, type PlanId } from "./billing";
import { tenantSlugSchema, type MemberDto } from "./tenant";

// -- schemas -------------------------------------------------------------------

export const updateAdminUserSchema = z.object({
  isPlatformAdmin: z.boolean(),
});

export const updateAdminTenantSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    slug: tenantSlugSchema.optional(),
    planId: planIdSchema.optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.slug !== undefined || data.planId !== undefined,
    {
      message: "Provide name, slug, and/or planId",
    },
  );

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
  planId: PlanId;
  memberCount: number;
  members: MemberDto[];
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
