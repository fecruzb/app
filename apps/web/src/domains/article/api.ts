import type { z } from "zod";
import { articleInputSchema, type ArticleDto } from "@app/shared";
import { api } from "@/lib/api";

export const articleApi = {
  list: (tenantId: string, search?: string) => {
    const q = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    return api.get<ArticleDto[]>(`/tenants/${tenantId}/articles${q}`);
  },
  get: (tenantId: string, id: string) => api.get<ArticleDto>(`/tenants/${tenantId}/articles/${id}`),
  create: (tenantId: string, body: z.infer<typeof articleInputSchema>) =>
    api.post<ArticleDto>(`/tenants/${tenantId}/articles`, body),
  update: (tenantId: string, id: string, body: z.infer<typeof articleInputSchema>) =>
    api.patch<ArticleDto>(`/tenants/${tenantId}/articles/${id}`, body),
  delete: (tenantId: string, id: string) => api.delete(`/tenants/${tenantId}/articles/${id}`),
  uploadCover: (tenantId: string, id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<ArticleDto>(`/tenants/${tenantId}/articles/${id}/cover`, form);
  },
  generateCover: (tenantId: string, id: string, prompt?: string) =>
    api.post<ArticleDto>(
      `/tenants/${tenantId}/agent/articles/${id}/cover`,
      prompt ? { prompt } : {},
    ),
  deleteCover: (tenantId: string, id: string) =>
    api.delete<ArticleDto>(`/tenants/${tenantId}/articles/${id}/cover`),
  publish: (tenantId: string, id: string, published: boolean) =>
    api.post<ArticleDto>(`/tenants/${tenantId}/articles/${id}/publish`, { published }),
};
