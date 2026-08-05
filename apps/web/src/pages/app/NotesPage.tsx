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
import { api, ApiError } from "@/api";
import { useTenant } from "@/providers/tenant";

// Página de exemplo com o padrão completo: query + mutations + dialog de
// criar/editar. Copie como base para os recursos do seu produto.

export function NotesPage() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NoteDto | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", tenant.id],
    queryFn: () => api.get<NoteDto[]>(`/tenants/${tenant.id}/notes`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notes", tenant.id] });

  const saveMutation = useMutation({
    mutationFn: (input: { title: string; content: string }) =>
      editing
        ? api.patch<NoteDto>(`/tenants/${tenant.id}/notes/${editing.id}`, input)
        : api.post<NoteDto>(`/tenants/${tenant.id}/notes`, input),
    onSuccess: () => {
      void invalidate();
      setDialogOpen(false);
      toast.success(editing ? "Nota atualizada" : "Nota criada");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tenants/${tenant.id}/notes/${id}`),
    onSuccess: () => void invalidate(),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Erro ao excluir"),
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
          <h1 className="text-2xl font-semibold">Notas</h1>
          <p className="text-muted-foreground">Recurso de exemplo com CRUD por tenant</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon /> Nova nota
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
                      <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (window.confirm(`Excluir a nota "${note.title}"?`)) {
                          deleteMutation.mutate(note.id);
                        }
                      }}
                    >
                      <Trash2Icon />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {note.authorName ?? "—"} · {new Date(note.updatedAt).toLocaleDateString("pt-BR")}
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
            Nenhuma nota ainda. Crie a primeira!
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar nota" : "Nova nota"}</DialogTitle>
            <DialogDescription>
              {editing ? "Atualize o conteúdo da nota." : "Adicione uma nota ao tenant."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="note-title">Título</Label>
              <Input
                id="note-title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note-content">Conteúdo</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
