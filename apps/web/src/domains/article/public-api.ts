import type { PublicArticleDto, PublicArticleSummaryDto } from "@app/shared";
import { api } from "@/lib/api";

/** Anonymous public catalog — no tenant scope. */
export const publicArticleApi = {
  list: () => api.get<PublicArticleSummaryDto[]>("/articles"),
  get: (id: string) => api.get<PublicArticleDto>(`/articles/${id}`),
};
