import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { TaskDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useTenant } from "@/domains/tenant/tenant-provider";
import { taskApi } from "../api";

// Example page with the full pattern: query + mutations for a to-do list.
// Copy as the base for your product's resources.

export function TasksPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
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
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to add task"),
  });

  const toggleMutation = useMutation({
    mutationFn: (task: TaskDto) =>
      taskApi.update(tenant.id, task.id, { title: task.title, completed: !task.completed }),
    onSuccess: () => void invalidate(),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskApi.remove(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (value) createMutation.mutate(value);
  }

  const remaining = tasks?.filter((t) => !t.completed).length ?? 0;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-muted-foreground">
          Example resource with per-tenant CRUD
          {tasks && tasks.length > 0 && ` · ${remaining} of ${tasks.length} left`}
        </p>
      </div>

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
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm(`Delete the task "${task.title}"?`)) {
                      deleteMutation.mutate(task.id);
                    }
                  }}
                >
                  <Trash2Icon />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No tasks yet. Add the first one!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
