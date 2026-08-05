import type { NoteDto } from "@app/shared";
import { api } from "@/lib/api";

export const noteApi = {
  list: (tenantId: string) => api.get<NoteDto[]>(`/tenants/${tenantId}/notes`),
  create: (tenantId: string, body: { title: string; content: string }) =>
    api.post<NoteDto>(`/tenants/${tenantId}/notes`, body),
  update: (tenantId: string, id: string, body: { title: string; content: string }) =>
    api.patch<NoteDto>(`/tenants/${tenantId}/notes/${id}`, body),
  remove: (tenantId: string, id: string) => api.delete(`/tenants/${tenantId}/notes/${id}`),
};
