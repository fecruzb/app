import type { ImageDto } from "@app/shared";
import { api } from "@/lib/api";

export const imageApi = {
  list: (tenantId: string) => api.get<ImageDto[]>(`/tenants/${tenantId}/images`),
  upload: (tenantId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<ImageDto>(`/tenants/${tenantId}/images`, form);
  },
  delete: (tenantId: string, id: string) => api.delete(`/tenants/${tenantId}/images/${id}`),
};
