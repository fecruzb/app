import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageLoading } from "@app/ui/page-loading";
import { EmptyState } from "@app/ui/empty-state";
import { useDocumentMeta } from "@/lib/document-meta";
import { publicArticleApi } from "@/domains/article/public-api";
import { MarketingShell } from "../components/marketing-shell";

export function PublicArticlesPage() {
  const { t, i18n } = useTranslation();
  const { data: articles, isLoading } = useQuery({
    queryKey: ["public-articles"],
    queryFn: () => publicArticleApi.list(),
  });

  useDocumentMeta({
    title: `${t("landing.articles.title")} · App Base`,
    description: t("landing.articles.description"),
    path: "/articles",
  });

  const dateFmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });

  return (
    <MarketingShell>
      <section className="border-b px-4 pt-16 pb-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium text-primary">{t("landing.articles.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {t("landing.articles.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">
            {t("landing.articles.description")}
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-5xl">
          {isLoading ? (
            <PageLoading />
          ) : articles && articles.length > 0 ? (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <li key={article.id}>
                  <Link
                    to={`/articles/${article.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-muted">
                      {article.coverUrl ? (
                        <img
                          src={article.coverUrl}
                          alt=""
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                          {t("landing.articles.noCover")}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h2 className="text-lg font-semibold tracking-tight text-balance group-hover:underline">
                        {article.title}
                      </h2>
                      <p className="mt-auto text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          @{article.tenantSlug}
                        </span>
                        {article.authorName ? ` · ${article.authorName}` : ""}
                        {" · "}
                        {dateFmt.format(new Date(article.publishedAt))}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>{t("landing.articles.empty")}</EmptyState>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}
