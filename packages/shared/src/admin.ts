import { z } from "zod";

// -- schemas -------------------------------------------------------------------

export const updateAdminUserSchema = z.object({
  isPlatformAdmin: z.boolean(),
});

export const updateAdminTenantSchema = z.object({
  name: z.string().trim().min(2).max(100),
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
