import { z } from "zod";

export const tenantRoles = ["owner", "admin", "member"] as const;
export type TenantRole = (typeof tenantRoles)[number];

/** Roles que podem gerenciar o tenant (renomear, membros, convites). */
export const managerRoles: TenantRole[] = ["owner", "admin"];

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

/** Aceite de convite criando conta nova (usuário deslogado). */
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

/** Dados públicos de um convite, exibidos na tela de aceite. */
export type PublicInviteDto = {
  tenantName: string;
  email: string;
  role: TenantRole;
  userExists: boolean;
};
