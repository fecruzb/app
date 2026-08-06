import { useEffect, useRef, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, MicIcon, SendIcon, SparklesIcon, SquareIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import type { AgentAction, AgentMessage } from "@app/shared";
import { Button } from "@app/ui/button";
import { Textarea } from "@app/ui/textarea";
import { ApiError, showApiError } from "@/lib/api";
import { useAudioRecorder } from "@/lib/use-audio-recorder";
import { cn } from "@app/ui/lib/utils";
import { agentApi } from "./agent-api";
import { useTenant } from "./tenant-provider";

const SUGGESTIONS = [
  "who belongs to this tenant?",
  "add a task to prepare tomorrow's meeting",
  "what tasks are still open?",
];

type ChatMessage = AgentMessage & { actions?: AgentAction[] };

/**
 * Floating agent button: fixed in the corner, opens a chat backed by
 * /api/tenants/:id/agent — the assistant runs tools in the tenant context and
 * returns the reply + actions. Write actions invalidate the app queries.
 * Messages can be typed or dictated (recorded here, transcribed server-side).
 */
export function AgentFab() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, transcribing]);

  async function send(raw: string) {
    const content = raw.trim();
    if (!content || busy) return;
    setText("");
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setBusy(true);
    try {
      const result = await agentApi.chat(
        tenant.id,
        history.map(({ role, content }) => ({ role, content })),
      );
      setMessages([
        ...history,
        { role: "assistant", content: result.reply, actions: result.actions },
      ]);
      // Write actions change tenant data — refresh whatever is on screen
      if (result.actions.some((a) => !a.isError)) {
        void queryClient.invalidateQueries();
      }
    } catch (err) {
      // The 402 from the monthly AI budget lands here and shows in the chat.
      const message = err instanceof ApiError ? err.message : "Failed to reach the agent";
      setMessages([...history, { role: "assistant", content: `⚠ ${message}` }]);
      setText(content);
    } finally {
      setBusy(false);
      void queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
    }
  }

  /** Dictated message: transcribe first, then send it like any other. */
  async function handleAudio(audio: Blob) {
    setTranscribing(true);
    let transcript: string;
    try {
      transcript = (await agentApi.transcribe(tenant.id, audio)).text.trim();
    } catch (err) {
      showApiError(err, "Failed to transcribe the recording");
      return;
    } finally {
      setTranscribing(false);
      // Transcription is billed too — keep the usage card honest.
      void queryClient.invalidateQueries({ queryKey: ["ai-usage"] });
    }

    if (!transcript) {
      toast.warning("Couldn't hear that — try again");
      return;
    }
    void send(transcript);
  }

  const recorder = useAudioRecorder({
    onAudio: (audio) => void handleAudio(audio),
    onError: (kind) =>
      toast.error(
        kind === "permission"
          ? "I need permission to use the microphone"
          : "This browser doesn't support audio recording",
      ),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  function handleClose() {
    recorder.cancel();
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        size="icon"
        className="fixed bottom-5 right-5 z-50 size-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
      >
        <SparklesIcon className="size-5" />
        <span className="sr-only">Open assistant</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-x-4 bottom-5 z-50 flex h-[28rem] max-h-[calc(100dvh-5rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-xl md:inset-x-auto md:right-5 md:w-96">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <SparklesIcon className="size-4" />
        <span className="flex-1 text-sm font-semibold">Assistant</span>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])} disabled={busy}>
            Clear
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <XIcon />
          <span className="sr-only">Close</span>
        </Button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              Ask or request something about <strong>{tenant.name}</strong>. Examples:
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

        {(busy || transcribing) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            {transcribing ? "Transcribing..." : "Thinking..."}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t p-3">
        {recorder.recording ? (
          <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 pl-3 pr-1">
            <span className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
              <span className="size-2 animate-pulse rounded-full bg-destructive" />
              Recording...
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={recorder.cancel}
            >
              <XIcon />
              <span className="sr-only">Cancel recording</span>
            </Button>
          </div>
        ) : (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(text);
              }
            }}
            placeholder={transcribing ? "Transcribing..." : "Talk to the assistant..."}
            rows={1}
            className="min-h-9 resize-none"
            disabled={busy || transcribing}
          />
        )}

        {/* One slot, three jobs: start the recording, stop it, or send the text. */}
        {recorder.recording ? (
          <Button type="button" size="icon" variant="destructive" onClick={recorder.stop}>
            <SquareIcon className="size-3 fill-current" />
            <span className="sr-only">Finish recording</span>
          </Button>
        ) : text.trim() ? (
          <Button type="submit" size="icon" disabled={busy}>
            <SendIcon />
            <span className="sr-only">Send</span>
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={busy || transcribing}
            onClick={() => void recorder.start()}
          >
            {transcribing ? <Loader2Icon className="animate-spin" /> : <MicIcon />}
            <span className="sr-only">Record a message</span>
          </Button>
        )}
      </form>
    </div>
  );
}
