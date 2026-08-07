import type { z } from "zod";
import {
  articleInputSchema,
  articlePublishSchema,
  generateArticleCoverSchema,
  type ArticleDto,
  type PublicArticleDto,
  type PublicArticleSummaryDto,
} from "@app/shared";
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
  generateCover: (
    tenantId: string,
    id: string,
    body: z.infer<typeof generateArticleCoverSchema> = {},
  ) => api.post<ArticleDto>(`/tenants/${tenantId}/agent/articles/${id}/cover`, body),
  deleteCover: (tenantId: string, id: string) =>
    api.delete<ArticleDto>(`/tenants/${tenantId}/articles/${id}/cover`),
  publish: (tenantId: string, id: string, body: z.infer<typeof articlePublishSchema>) =>
    api.post<ArticleDto>(`/tenants/${tenantId}/articles/${id}/publish`, body),
};

/** Anonymous public catalog — no tenant scope (consumed by the marketing pages). */
export const publicArticleApi = {
  list: () => api.get<PublicArticleSummaryDto[]>("/articles"),
  get: (id: string) => api.get<PublicArticleDto>(`/articles/${id}`),
};
