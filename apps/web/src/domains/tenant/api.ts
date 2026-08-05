import type {
  AgentMessage,
  AgentResult,
  InviteDto,
  MemberDto,
  PublicInviteDto,
  TenantRole,
} from "@app/shared";
import { api } from "@/lib/api";

export const tenantApi = {
  members: (tenantId: string) => api.get<MemberDto[]>(`/tenants/${tenantId}/members`),
  rename: (tenantId: string, name: string) => api.patch(`/tenants/${tenantId}`, { name }),
  setMemberRole: (tenantId: string, userId: string, role: TenantRole) =>
    api.patch(`/tenants/${tenantId}/members/${userId}`, { role }),
  removeMember: (tenantId: string, userId: string) =>
    api.delete(`/tenants/${tenantId}/members/${userId}`),
  invites: (tenantId: string) => api.get<InviteDto[]>(`/tenants/${tenantId}/invites`),
  createInvite: (tenantId: string, body: { email: string; role: "admin" | "member" }) =>
    api.post<InviteDto>(`/tenants/${tenantId}/invites`, body),
  revokeInvite: (tenantId: string, inviteId: string) =>
    api.delete(`/tenants/${tenantId}/invites/${inviteId}`),
  getInvite: (token: string) => api.get<PublicInviteDto>(`/invites/${token}`),
  acceptInvite: (token: string, body?: { name: string; password: string }) =>
    api.post<{ tenantSlug: string }>(`/invites/${token}/accept`, body),
  agentChat: (tenantId: string, messages: AgentMessage[]) =>
    api.post<AgentResult>(`/tenants/${tenantId}/agent`, { messages }),
};
