import type { z } from "zod";
import {
  taskInputSchema,
  type TaskDto,
} from "@app/shared";
import { api } from "@/lib/api";

export const taskApi = {
  list: (tenantId: string, search?: string) => {
    const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return api.get<TaskDto[]>(`/tenants/${tenantId}/tasks${q}`);
  },
  create: (tenantId: string, body: z.infer<typeof taskInputSchema>) =>
    api.post<TaskDto>(`/tenants/${tenantId}/tasks`, body),
  update: (tenantId: string, id: string, body: z.infer<typeof taskInputSchema>) =>
    api.patch<TaskDto>(`/tenants/${tenantId}/tasks/${id}`, body),
  delete: (tenantId: string, id: string) => api.delete(`/tenants/${tenantId}/tasks/${id}`),
};
