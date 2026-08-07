import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon } from "lucide-react";
import { PageLoading } from "@app/ui/page-loading";
import { useDocumentMeta } from "@/lib/document-meta";
import { publicArticleApi } from "@/domains/article/public-api";
import { ArticleEditor } from "@/domains/article/components/article-editor";
import { MarketingShell } from "../components/marketing-shell";

function excerpt(body: string, max = 160): string {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export function PublicArticlePage() {
  const { t, i18n } = useTranslation();
  const { articleId = "" } = useParams();

  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["public-articles", articleId],
    queryFn: () => publicArticleApi.get(articleId),
    enabled: Boolean(articleId),
  });

  useDocumentMeta({
    title: article ? `${article.title} · App Base` : t("landing.seo.articleFallback.title"),
    description: article
      ? excerpt(article.body) || t("landing.seo.articles.description")
      : t("landing.seo.articleFallback.description"),
    image: article?.coverUrl,
    path: article ? `/articles/${article.id}` : undefined,
    type: "article",
  });

  const dateFmt = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "long",
  });

  return (
    <MarketingShell>
      <article className="px-4 pt-10 pb-20">
        <div className="mx-auto grid w-full max-w-5xl gap-8">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            {t("landing.articles.back")}
          </Link>

          {isLoading ? (
            <PageLoading />
          ) : isError || !article ? (
            <p className="text-muted-foreground">{t("landing.articles.notFound")}</p>
          ) : (
            <>
              {article.coverUrl ? (
                <img
                  src={article.coverUrl}
                  alt=""
                  className="aspect-[2/1] w-full rounded-xl object-cover"
                />
              ) : null}

              <header className="grid gap-3">
                <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  {article.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">@{article.tenantSlug}</span>
                  <span className="text-muted-foreground/80"> · {article.tenantName}</span>
                  {article.authorName ? ` · ${article.authorName}` : ""}
                  {" · "}
                  {dateFmt.format(new Date(article.publishedAt))}
                </p>
              </header>

              <ArticleEditor
                key={article.id}
                defaultValue={article.body}
                readonly
                className="border-0 bg-transparent"
              />
            </>
          )}
        </div>
      </article>
    </MarketingShell>
  );
}
