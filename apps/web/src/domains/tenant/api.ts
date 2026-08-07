import type { z } from "zod";
import {
  acceptInviteNewAccountSchema,
  createInviteSchema,
  updateMemberSchema,
  updateTenantSchema,
  type AcceptInviteResultDto,
  type InviteDto,
  type MemberDto,
  type OkDto,
  type PublicInviteDto,
} from "@app/shared";
import { api } from "@/lib/api";

export const tenantApi = {
  members: (tenantId: string) => api.get<MemberDto[]>(`/tenants/${tenantId}/members`),
  rename: (tenantId: string, body: z.infer<typeof updateTenantSchema>) =>
    api.patch(`/tenants/${tenantId}`, body),
  setMemberRole: (tenantId: string, userId: string, body: z.infer<typeof updateMemberSchema>) =>
    api.patch(`/tenants/${tenantId}/members/${userId}`, body),
  removeMember: (tenantId: string, userId: string) =>
    api.delete<OkDto>(`/tenants/${tenantId}/members/${userId}`),
  invites: (tenantId: string) => api.get<InviteDto[]>(`/tenants/${tenantId}/invites`),
  createInvite: (tenantId: string, body: z.infer<typeof createInviteSchema>) =>
    api.post<InviteDto>(`/tenants/${tenantId}/invites`, body),
  revokeInvite: (tenantId: string, inviteId: string) =>
    api.delete<OkDto>(`/tenants/${tenantId}/invites/${inviteId}`),
  getInvite: (token: string) => api.get<PublicInviteDto>(`/invites/${token}`),
  acceptInvite: (token: string, body?: z.infer<typeof acceptInviteNewAccountSchema>) =>
    api.post<AcceptInviteResultDto>(`/invites/${token}/accept`, body),
};
