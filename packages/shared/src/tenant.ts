import { z } from "zod";

export const tenantRoles = ["owner", "admin", "member"] as const;
export type TenantRole = (typeof tenantRoles)[number];

/** Roles that can manage the tenant (rename, members, invites). */
export const managerRoles: TenantRole[] = ["owner", "admin"];

/** URL-safe tenant slug (matches slugify rules). */
export const tenantSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

// -- schemas -------------------------------------------------------------------

export const updateTenantSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const createInviteSchema = z.object({
  email: z.email().toLowerCase(),
  role: z.enum(["admin", "member"]),
});

export const updateMemberSchema = z.object({
  role: z.enum(tenantRoles),
});

/** Invite acceptance that creates a new account (logged-out user). */
export const acceptInviteNewAccountSchema = z.object({
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(200),
});

// -- DTOs ----------------------------------------------------------------------

export type TenantSummaryDto = {
  id: string;
  name: string;
  slug: string;
  role: TenantRole;
};

export type MemberDto = {
  userId: string;
  name: string;
  email: string;
  role: TenantRole;
  joinedAt: string;
};

export type InviteDto = {
  id: string;
  email: string;
  role: TenantRole;
  invitedByName: string | null;
  createdAt: string;
  expiresAt: string;
};

/** Public invite data, shown on the accept screen. */
export type PublicInviteDto = {
  tenantName: string;
  email: string;
  role: TenantRole;
  userExists: boolean;
};
