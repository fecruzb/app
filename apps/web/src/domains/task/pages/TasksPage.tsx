import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react";
import type { TaskDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PageLoading } from "@/components/page-loading";
import { showApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTenant } from "@/domains/tenant/tenant-provider";
import { taskApi } from "../api";

// Canonical internal page: a query for reads, mutations for writes, and the
// shared PageHeader / PageLoading / EmptyState / useConfirm. Copy this shape.

export function TasksPage() {
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
    onError: (err) => showApiError(err, "Failed to add task"),
  });

  const toggleMutation = useMutation({
    mutationFn: (task: TaskDto) =>
      taskApi.update(tenant.id, task.id, { title: task.title, completed: !task.completed }),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, "Failed to update task"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.delete(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, "Failed to delete task"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (value) createMutation.mutate(value);
  }

  async function handleDelete(task: TaskDto) {
    const ok = await confirm({
      title: "Delete task",
      description: `Delete "${task.title}"?`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(task.id);
  }

  const remaining = tasks?.filter((t) => !t.completed).length ?? 0;

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Tasks"
        description={`Example resource with per-tenant CRUD${
          tasks && tasks.length > 0 ? ` · ${remaining} of ${tasks.length} left` : ""
        }`}
      />

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a task..."
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit" disabled={createMutation.isPending || !title.trim()}>
          <PlusIcon /> Add
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
                    {task.completed ? "Mark as not done" : "Mark as done"}
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
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <EmptyState>No tasks yet. Add the first one!</EmptyState>
      )}
    </div>
  );
}
