import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { TaskDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { useConfirm } from "@app/ui/confirm-dialog";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { cn } from "@app/ui/lib/utils";
import { useTenant } from "@/domains/tenant/context/tenant-provider";
import { taskApi } from "../api";

// Canonical internal page: a query for reads, mutations for writes, and the
// shared PageHeader / PageLoading / EmptyState / useConfirm. Copy this shape.

export function TasksPage() {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [title, setTitle] = useState("");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", tenant.id],
    queryFn: () => taskApi.list(tenant.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks", tenant.id] });

  const createMutation = useMutation({
    mutationFn: (value: string) => taskApi.create(tenant.id, { title: value }),
    onSuccess: () => {
      void invalidate();
      setTitle("");
    },
    onError: (err) => showApiError(err, t("tasks.addFailed")),
  });

  const toggleMutation = useMutation({
    mutationFn: (task: TaskDto) =>
      taskApi.update(tenant.id, task.id, { title: task.title, completed: !task.completed }),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, t("tasks.updateFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.delete(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, t("tasks.deleteFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (value) createMutation.mutate(value);
  }

  async function handleDelete(task: TaskDto) {
    const ok = await confirm({
      title: t("tasks.deleteTitle"),
      description: t("tasks.deleteDescription", { title: task.title }),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) deleteMutation.mutate(task.id);
  }

  const remaining = tasks?.filter((task) => !task.completed).length ?? 0;
  const description =
    t("tasks.description") +
    (tasks && tasks.length > 0 ? t("tasks.remaining", { remaining, total: tasks.length }) : "");

  return (
    <div className="grid gap-6">
      <PageHeader title={t("tasks.title")} description={description} />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder={t("tasks.placeholder")}
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
          <PlusIcon /> {t("tasks.add")}
        </Button>
      </form>

      {isLoading ? (
        <PageLoading />
      ) : tasks && tasks.length > 0 ? (
        <Card>
          <CardContent className="divide-y p-0">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  aria-pressed={task.completed}
                  onClick={() => toggleMutation.mutate(task)}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    task.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:border-primary",
                  )}
                >
                  {task.completed && <CheckIcon className="size-3.5" />}
                  <span className="sr-only">
                    {task.completed ? t("tasks.markNotDone") : t("tasks.markDone")}
                  </span>
                </button>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm",
                    task.completed && "text-muted-foreground line-through",
                  )}
                >
                  {task.title}
                </span>
                <Button variant="ghost" size="icon" onClick={() => void handleDelete(task)}>
                  <Trash2Icon />
                  <span className="sr-only">{t("common.delete")}</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState>{t("tasks.empty")}</EmptyState>
      )}
    </div>
  );
}
