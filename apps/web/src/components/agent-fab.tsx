import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, SendIcon, SparklesIcon, XIcon } from "lucide-react";
import type { AgentAction, AgentMessage, AgentResult } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/api";
import { cn } from "@/lib/utils";
import { useTenant } from "@/providers/tenant";

const SUGGESTIONS = [
  "quem participa deste tenant?",
  "cria uma nota com as pautas da reunião de amanhã",
  "resume as notas que temos",
];

type ChatMessage = AgentMessage & { actions?: AgentAction[] };

/**
 * Botão flutuante do agente (padrão Zyron/Symulous/Cookbook): fixo no canto,
 * abre um chat que conversa com /api/tenants/:id/agent — o assistente executa
 * as tools do MCP no contexto do tenant e devolve a resposta + ações.
 * Após ações de escrita, as queries do app são invalidadas para a UI refletir.
 */
export function AgentFab() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(raw: string) {
    const content = raw.trim();
    if (!content || busy) return;
    setText("");
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setBusy(true);
    try {
      const result = await api.post<AgentResult>(`/tenants/${tenant.id}/agent`, {
        messages: history.map(({ role, content }) => ({ role, content })),
      });
      setMessages([
        ...history,
        { role: "assistant", content: result.reply, actions: result.actions },
      ]);
      // Ações de escrita mudam dados do tenant — recarrega o que estiver na tela
      if (result.actions.some((a) => !a.isError)) {
        void queryClient.invalidateQueries();
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Erro ao falar com o agente";
      setMessages([...history, { role: "assistant", content: `⚠ ${message}` }]);
      setText(content);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  if (!open) {
    return (
      <Button
        size="icon"
        className="fixed bottom-5 right-5 z-50 size-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <SparklesIcon className="size-5" />
        <span className="sr-only">Abrir assistente</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-5 z-50 flex h-[28rem] max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-xl md:inset-x-auto md:right-5 md:w-96">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <SparklesIcon className="size-4" />
        <span className="flex-1 text-sm font-semibold">Assistente</span>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} disabled={busy}>
            Limpar
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
          <XIcon />
          <span className="sr-only">Fechar</span>
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              Pergunte ou peça algo sobre <strong>{tenant.name}</strong>. Exemplos:
            </p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-md border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => void send(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((message, i) => (
          <div key={i} className={cn("flex", message.role === "user" && "justify-end")}>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {message.content}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.actions.map((action, j) => (
                    <span
                      key={j}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs",
                        action.isError
                          ? "border-destructive/50 text-destructive"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {action.summary}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" /> Pensando...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(text);
            }
          }}
          placeholder="Fale com o assistente..."
          rows={1}
          className="min-h-9 resize-none"
          disabled={busy}
        />
        <Button type="submit" size="icon" disabled={busy || !text.trim()}>
          <SendIcon />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
