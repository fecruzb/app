import { useState, type FormEvent, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PlusIcon, Trash2Icon } from "lucide-react";
import type { ArticleDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Input } from "@app/ui/input";
import { useConfirm } from "@app/ui/confirm-dialog";
import { DataTable, type DataTableColumn } from "@app/ui/data-table";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { useTenant } from "@/domains/tenant/context/tenant-provider";
import { articleApi } from "../api";

export function ArticlesPage() {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["articles", tenant.id, search],
    queryFn: () => articleApi.list(tenant.id, search || undefined),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["articles", tenant.id] });

  const createMutation = useMutation({
    mutationFn: (value: string) => articleApi.create(tenant.id, { title: value, body: "" }),
    onSuccess: (article) => {
      void invalidate();
      setTitle("");
      void navigate(`/app/${tenant.slug}/articles/${article.id}`);
    },
    onError: (err) => showApiError(err, t("articles.createFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articleApi.delete(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, t("articles.deleteFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (value) createMutation.mutate(value);
  }

  async function handleDelete(article: ArticleDto, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: t("articles.deleteTitle"),
      description: t("articles.deleteDescription", { title: article.title }),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) deleteMutation.mutate(article.id);
  }

  const dateFmt = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const columns: DataTableColumn<ArticleDto>[] = [
    {
      id: "cover",
      header: "",
      className: "w-14",
      cell: (row) =>
        row.coverUrl ? (
          <img src={row.coverUrl} alt="" className="size-10 rounded-md object-cover" />
        ) : (
          <div className="size-10 rounded-md bg-muted" />
        ),
    },
    {
      id: "title",
      header: t("articles.columnTitle"),
      sortValue: (row) => row.title,
      cell: (row) => (
        <Link to={`/app/${tenant.slug}/articles/${row.id}`} className="font-medium hover:underline">
          {row.title}
        </Link>
      ),
    },
    {
      id: "author",
      header: t("articles.columnAuthor"),
      sortValue: (row) => row.authorName ?? "",
      cell: (row) => (
        <span className="text-muted-foreground">{row.authorName ?? t("common.emptyValue")}</span>
      ),
    },
    {
      id: "status",
      header: t("articles.columnStatus"),
      sortValue: (row) => (row.publishedAt ? 1 : 0),
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.publishedAt ? t("articles.statusPublished") : t("articles.statusDraft")}
        </span>
      ),
    },
    {
      id: "updatedAt",
      header: t("articles.columnUpdated"),
      sortValue: (row) => new Date(row.updatedAt),
      cell: (row) => (
        <span className="text-muted-foreground">{dateFmt.format(new Date(row.updatedAt))}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-12",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={(e) => void handleDelete(row, e)}>
          <Trash2Icon />
          <span className="sr-only">{t("common.delete")}</span>
        </Button>
      ),
    },
  ];

  const description =
    t("articles.description") +
    (articles && articles.length > 0 ? t("articles.total", { count: articles.length }) : "");

  return (
    <div className="grid gap-6">
      <PageHeader title={t("articles.title")} description={description} />

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
        <Input
          placeholder={t("articles.placeholder")}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-48 flex-1"
        />
        <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
          <PlusIcon /> {t("articles.add")}
        </Button>
      </form>

      <Input
        placeholder={t("articles.search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <PageLoading />
      ) : (
        <DataTable
          columns={columns}
          data={articles ?? []}
          getRowId={(row) => row.id}
          pageSize={10}
          pagination={{
            previousLabel: t("articles.paginationPrevious"),
            nextLabel: t("articles.paginationNext"),
            pageLabel: (page, pages) => t("articles.paginationPage", { page, pages }),
          }}
          empty={<EmptyState>{t("articles.empty")}</EmptyState>}
        />
      )}
    </div>
  );
}
