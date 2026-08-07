import { z } from "zod";
import { emailSchema, passwordSchema, userNameSchema } from "./auth";
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
  email: emailSchema,
});

export const acceptPlatformInviteSchema = z.object({
  name: userNameSchema,
  password: passwordSchema,
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
