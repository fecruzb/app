import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeftIcon, ExternalLinkIcon, GlobeIcon, Trash2Icon } from "lucide-react";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { useConfirm } from "@app/ui/confirm-dialog";
import { PageLoading } from "@app/ui/page-loading";
import { useAppConfig } from "@/app/config";
import { showApiError } from "@/lib/api";
import { useTenant } from "@/domains/tenant/context/tenant-provider";
import { articleApi } from "../api";
import { ArticleCoverField } from "../components/article-cover-field";
import { ArticleEditor, type ArticleEditorHandle } from "../components/article-editor";

export function ArticlePage() {
  const { t } = useTranslation();
  const { articleId = "" } = useParams();
  const { tenant } = useTenant();
  const { aiEnabled } = useAppConfig();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const editorRef = useRef<ArticleEditorHandle | null>(null);

  const [title, setTitle] = useState("");
  const [bodyDraft, setBodyDraft] = useState("");
  const [savedTitle, setSavedTitle] = useState("");
  const [savedBody, setSavedBody] = useState("");

  const { data: article, isLoading } = useQuery({
    queryKey: ["articles", tenant.id, articleId],
    queryFn: () => articleApi.get(tenant.id, articleId),
    enabled: Boolean(articleId),
  });

  useEffect(() => {
    if (!article) return;
    setTitle(article.title);
    setBodyDraft(article.body);
    setSavedTitle(article.title);
    setSavedBody(article.body);
  }, [article]);

  const dirty = title.trim() !== savedTitle.trim() || bodyDraft !== savedBody;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["articles", tenant.id] });
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = editorRef.current?.getMarkdown() ?? bodyDraft;
      return articleApi.update(tenant.id, articleId, { title: title.trim(), body });
    },
    onSuccess: (updated) => {
      setSavedTitle(updated.title);
      setSavedBody(updated.body);
      setBodyDraft(updated.body);
      setTitle(updated.title);
      invalidate();
      toast.success(t("articles.saved"));
    },
    onError: (err) => showApiError(err, t("articles.saveFailed")),
  });

  const coverUploadMutation = useMutation({
    mutationFn: (file: File) => articleApi.uploadCover(tenant.id, articleId, file),
    onSuccess: () => invalidate(),
    onError: (err) => showApiError(err, t("articles.coverFailed")),
  });

  const coverGenerateMutation = useMutation({
    mutationFn: async () => {
      // Persist title/body first so the prompt uses what the user sees.
      const body = editorRef.current?.getMarkdown() ?? bodyDraft;
      if (title.trim() !== savedTitle.trim() || body !== savedBody) {
        const updated = await articleApi.update(tenant.id, articleId, {
          title: title.trim(),
          body,
        });
        setSavedTitle(updated.title);
        setSavedBody(updated.body);
        setBodyDraft(updated.body);
        setTitle(updated.title);
      }
      return articleApi.generateCover(tenant.id, articleId);
    },
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
    onError: (err) => showApiError(err, t("articles.generateCoverFailed")),
  });

  const coverDeleteMutation = useMutation({
    mutationFn: () => articleApi.deleteCover(tenant.id, articleId),
    onSuccess: () => invalidate(),
    onError: (err) => showApiError(err, t("articles.coverFailed")),
  });

  const publishMutation = useMutation({
    mutationFn: (published: boolean) => articleApi.publish(tenant.id, articleId, published),
    onSuccess: (updated) => {
      invalidate();
      void queryClient.invalidateQueries({ queryKey: ["public-articles"] });
      toast.success(updated.publishedAt ? t("articles.published") : t("articles.unpublished"));
    },
    onError: (err) => showApiError(err, t("articles.publishFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: () => articleApi.delete(tenant.id, articleId),
    onSuccess: () => {
      invalidate();
      void navigate(`/app/${tenant.slug}/articles`);
    },
    onError: (err) => showApiError(err, t("articles.deleteFailed")),
  });

  async function handleDelete() {
    if (!article) return;
    const ok = await confirm({
      title: t("articles.deleteTitle"),
      description: t("articles.deleteDescription", { title: article.title }),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) deleteMutation.mutate();
  }

  async function handleRemoveCover() {
    const ok = await confirm({
      title: t("articles.removeCoverTitle"),
      description: t("articles.removeCoverDescription"),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) coverDeleteMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <Link
          to={`/app/${tenant.slug}/articles`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t("articles.back")}
        </Link>
        <PageLoading />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="grid gap-6">
        <Link
          to={`/app/${tenant.slug}/articles`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t("articles.back")}
        </Link>
        <p className="text-muted-foreground">{t("articles.notFound")}</p>
      </div>
    );
  }

  const coverBusy =
    coverUploadMutation.isPending ||
    coverGenerateMutation.isPending ||
    coverDeleteMutation.isPending;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/app/${tenant.slug}/articles`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t("articles.back")}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          {dirty ? (
            <span className="text-xs text-muted-foreground">{t("articles.unsaved")}</span>
          ) : null}
          {article.publishedAt ? (
            <Button variant="outline" asChild>
              <a href={`/articles/${article.id}`} target="_blank" rel="noreferrer">
                <ExternalLinkIcon />
                {t("articles.viewPublic")}
              </a>
            </Button>
          ) : null}
          <Button
            variant="outline"
            disabled={publishMutation.isPending || dirty}
            onClick={() => publishMutation.mutate(!article.publishedAt)}
          >
            <GlobeIcon />
            {article.publishedAt ? t("articles.unpublish") : t("articles.publish")}
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !title.trim() || !dirty}
          >
            {saveMutation.isPending ? t("articles.saving") : t("articles.save")}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void handleDelete()}>
            <Trash2Icon />
            <span className="sr-only">{t("common.delete")}</span>
          </Button>
        </div>
      </div>

      <ArticleCoverField
        coverUrl={article.coverUrl}
        disabled={coverBusy || saveMutation.isPending}
        generating={coverGenerateMutation.isPending}
        canGenerate={aiEnabled}
        onUpload={(file) => coverUploadMutation.mutate(file)}
        onGenerate={() => coverGenerateMutation.mutate()}
        onRemove={() => void handleRemoveCover()}
      />

      <Input
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("articles.titlePlaceholder")}
        className="h-auto border-0 bg-transparent px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0"
      />

      {article.authorName ? (
        <p className="-mt-4 text-sm text-muted-foreground">
          {t("articles.byAuthor", { name: article.authorName })}
        </p>
      ) : null}

      <ArticleEditor
        key={article.id}
        editorRef={editorRef}
        defaultValue={article.body}
        placeholder={t("articles.bodyPlaceholder")}
        onChange={setBodyDraft}
      />
    </div>
  );
}
