import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(200),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(200),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

export const tenantRoles = ["owner", "admin", "member"] as const;
export type TenantRole = (typeof tenantRoles)[number];

/** Roles que podem gerenciar o tenant (renomear, membros, convites). */
export const managerRoles: TenantRole[] = ["owner", "admin"];

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

// ---------------------------------------------------------------------------
// Agente
// ---------------------------------------------------------------------------

export const agentMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const agentChatSchema = z.object({
  messages: z.array(agentMessageSchema).min(1).max(40),
});

export type AgentMessage = z.infer<typeof agentMessageSchema>;

/** Ação de escrita executada pelo agente, exibida como chip na UI. */
export type AgentAction = {
  tool: string;
  summary: string;
  isError: boolean;
};

export type AgentResult = {
  reply: string;
  actions: AgentAction[];
};

// ---------------------------------------------------------------------------
// Notes (recurso de exemplo — troque pelo domínio do seu produto)
// ---------------------------------------------------------------------------

export const noteInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(20000),
});

// ---------------------------------------------------------------------------
// DTOs (formato das respostas da API)
// ---------------------------------------------------------------------------

export type UserDto = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
};

export type TenantSummaryDto = {
  id: string;
  name: string;
  slug: string;
  role: TenantRole;
};

export type MeDto = {
  user: UserDto;
  tenants: TenantSummaryDto[];
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

export type NoteDto = {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  error: string;
};
