import type { z } from "zod";
import {
  acceptInviteNewAccountSchema,
  createInviteSchema,
  updateMemberSchema,
  updateTenantSchema,
  type AgentMessage,
  type AgentResult,
  type AgentTranscriptDto,
  type InviteDto,
  type MemberDto,
  type PublicInviteDto,
} from "@app/shared";
import { api } from "@/lib/api";

/**
 * OpenAI picks the decoder from the file extension, so it has to match the
 * container the browser actually recorded — Safari's audio/mp4 sent as .webm
 * comes back as a corrupted file.
 */
function audioExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4") || mimeType.includes("aac")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

export const tenantApi = {
  members: (tenantId: string) => api.get<MemberDto[]>(`/tenants/${tenantId}/members`),
  rename: (tenantId: string, body: z.infer<typeof updateTenantSchema>) =>
    api.patch(`/tenants/${tenantId}`, body),
  setMemberRole: (tenantId: string, userId: string, body: z.infer<typeof updateMemberSchema>) =>
    api.patch(`/tenants/${tenantId}/members/${userId}`, body),
  removeMember: (tenantId: string, userId: string) =>
    api.delete(`/tenants/${tenantId}/members/${userId}`),
  invites: (tenantId: string) => api.get<InviteDto[]>(`/tenants/${tenantId}/invites`),
  createInvite: (tenantId: string, body: z.infer<typeof createInviteSchema>) =>
    api.post<InviteDto>(`/tenants/${tenantId}/invites`, body),
  revokeInvite: (tenantId: string, inviteId: string) =>
    api.delete(`/tenants/${tenantId}/invites/${inviteId}`),
  getInvite: (token: string) => api.get<PublicInviteDto>(`/invites/${token}`),
  acceptInvite: (token: string, body?: z.infer<typeof acceptInviteNewAccountSchema>) =>
    api.post<{ tenantSlug: string }>(`/invites/${token}/accept`, body),
};

/** In-app assistant chat and voice transcription (tenant-scoped agent routes). */
export const agentApi = {
  chat: (tenantId: string, messages: AgentMessage[]) =>
    api.post<AgentResult>(`/tenants/${tenantId}/agent`, { messages }),

  transcribe: (tenantId: string, audio: Blob) => {
    const form = new FormData();
    form.append("audio", audio, `recording.${audioExtension(audio.type)}`);
    return api.upload<AgentTranscriptDto>(`/tenants/${tenantId}/agent/transcribe`, form);
  },
};
