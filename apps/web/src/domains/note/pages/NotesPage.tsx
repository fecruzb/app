import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { NoteDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { useTenant } from "@/domains/tenant/tenant-provider";
import { noteApi } from "../api";

// Example page with the full pattern: query + mutations + create/edit dialog.
// Copy as the base for your product's resources.

export function NotesPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NoteDto | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", tenant.id],
    queryFn: () => noteApi.list(tenant.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notes", tenant.id] });

  const saveMutation = useMutation({
    mutationFn: (input: { title: string; content: string }) =>
      editing ? noteApi.update(tenant.id, editing.id, input) : noteApi.create(tenant.id, input),
    onSuccess: () => {
      void invalidate();
      setDialogOpen(false);
      toast.success(editing ? "Note updated" : "Note created");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to save"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => noteApi.remove(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to delete"),
  });

  function openCreate() {
    setEditing(null);
    setTitle("");
    setContent("");
    setDialogOpen(true);
  }

  function openEdit(note: NoteDto) {
    setEditing(note);
    setTitle(note.title);
    setContent(note.content);
    setDialogOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveMutation.mutate({ title, content });
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notes</h1>
          <p className="text-muted-foreground">Example resource with per-tenant CRUD</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon /> New note
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : notes && notes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="leading-snug">{note.title}</CardTitle>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(note)}>
                      <PencilIcon />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm(`Delete the note "${note.title}"?`)) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {note.authorName ?? "—"} · {new Date(note.updatedAt).toLocaleDateString("en-US")}
                </CardDescription>
              </CardHeader>
              {note.content && (
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {note.content}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No notes yet. Create the first one!
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit note" : "New note"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the note's content." : "Add a note to the tenant."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
