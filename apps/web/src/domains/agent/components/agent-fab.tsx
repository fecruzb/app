import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import {
  CheckIcon,
  Loader2Icon,
  Maximize2Icon,
  MicIcon,
  Minimize2Icon,
  SendIcon,
  SparklesIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { AgentMessage } from "@app/shared";
import { Button } from "@app/ui/button";
import { Textarea } from "@app/ui/textarea";
import { ApiError, showApiError } from "@/lib/api";
import { useTenant } from "@/domains/tenant/context/tenant-provider";
import { useAudioRecorder } from "../hooks/use-audio-recorder";
import { cn } from "@app/ui/lib/utils";
import { agentApi } from "../api";
import { AgentMarkdown } from "./agent-markdown";

/** One row in the chat transcript (user, tool step, assistant reply, or ephemeral status). */
type TimelineItem =
  | { kind: "user"; content: string }
  | { kind: "assistant"; content: string }
  | { kind: "tool"; id: string; summary: string; pending: boolean; isError?: boolean }
  | { kind: "status"; status: "thinking" };

type PanelSize = "compact" | "expanded";

/** Wire history for the API — tool chips are UI-only. */
function toApiMessages(items: TimelineItem[]): AgentMessage[] {
  return items.flatMap((item) => {
    if (item.kind === "user" || item.kind === "assistant") {
      return [{ role: item.kind, content: item.content }];
    }
    return [];
  });
}

/**
 * Floating agent button: fixed in the corner, opens a chat backed by
 * /api/tenants/:id/agent — streams each tool as its own chip in the
 * conversation, then the final reply. Write actions invalidate app queries.
 * Messages can be typed or dictated (recorded here, transcribed server-side).
 * Compact panel or expanded near-fullscreen; conversation survives minimize.
 */
export function AgentFab() {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<PanelSize>("compact");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendLock = useRef(false);

  const suggestions = t("agent.suggestions", { returnObjects: true });
  const suggestionList = Array.isArray(suggestions) ? (suggestions as string[]) : [];
  const expanded = size === "expanded";

  const transcribeMutation = useMutation({
    mutationFn: (audio: Blob) => agentApi.transcribe(tenant.id, audio),
    onSuccess: (data) => {
      const transcript = data.text.trim();
      if (!transcript) {
        toast.warning(t("agent.hearFailed"));
        return;
      }
      void send(transcript);
    },
    onError: (err) => showApiError(err, t("agent.transcribeFailed")),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    },
  });

  const transcribing = transcribeMutation.isPending;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [timeline, busy, transcribing]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (size === "expanded") {
        setSize("compact");
        return;
      }
      setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, size]);

  function clearStatus(items: TimelineItem[]): TimelineItem[] {
    return items.filter((item) => item.kind !== "status");
  }

  async function send(raw: string) {
    const content = raw.trim();
    // Only block while chat is in flight — do NOT gate on `transcribing`.
    // Transcribe's onSuccess runs while isPending is still true, so checking
    // it here would drop the transcript on the floor.
    if (!content || busy || sendLock.current) return;
    sendLock.current = true;
    setText("");

    const withUser: TimelineItem[] = [
      ...clearStatus(timeline),
      { kind: "user", content },
      { kind: "status", status: "thinking" },
    ];
    setTimeline(withUser);
    setBusy(true);
    setActivity(t("agent.thinking"));

    const apiHistory = toApiMessages(withUser);
    let sawDone = false;
    let shouldInvalidate = false;

    try {
      await agentApi.chat(tenant.id, apiHistory, (event) => {
        if (event.type === "status") {
          if (event.status === "thinking") {
            setActivity(t("agent.thinking"));
            setTimeline((prev) => [...clearStatus(prev), { kind: "status", status: "thinking" }]);
          }
          return;
        }
        if (event.type === "tool_start") {
          setActivity(event.summary);
          setTimeline((prev) => [
            ...clearStatus(prev),
            {
              kind: "tool",
              id: event.id,
              summary: event.summary,
              pending: true,
            },
          ]);
          return;
        }
        if (event.type === "tool_done") {
          setActivity(t("agent.thinking"));
          setTimeline((prev) =>
            prev.map((item) =>
              item.kind === "tool" && item.id === event.id
                ? {
                    ...item,
                    summary: event.summary,
                    pending: false,
                    isError: event.isError,
                  }
                : item,
            ),
          );
          return;
        }
        if (event.type === "error") {
          throw new ApiError(500, event.error);
        }
        if (event.type === "done") {
          sawDone = true;
          if (event.actions.some((a) => !a.isError)) shouldInvalidate = true;
          setTimeline((prev) => [
            ...clearStatus(prev),
            { kind: "assistant", content: event.reply },
          ]);
        }
      });
      if (!sawDone) {
        throw new ApiError(500, t("agent.reachFailed"));
      }
      if (shouldInvalidate) void queryClient.invalidateQueries();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("agent.reachFailed");
      setTimeline((prev) => [...clearStatus(prev), { kind: "assistant", content: `⚠ ${message}` }]);
      const lastUser = [...apiHistory].reverse().find((m) => m.role === "user");
      if (lastUser) setText(lastUser.content);
    } finally {
      setBusy(false);
      setActivity(null);
      sendLock.current = false;
      // Show the finished turn even if the user minimized mid-run.
      setOpen(true);
      setSize("compact");
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    }
  }

  const recorder = useAudioRecorder({
    onAudio: (audio) => transcribeMutation.mutate(audio),
    onError: (kind) =>
      toast.error(kind === "permission" ? t("agent.micPermission") : t("agent.micUnsupported")),
  });

  const busyRef = useRef(busy);
  const transcribingRef = useRef(transcribing);
  const recordingRef = useRef(recorder.recording);
  useEffect(() => {
    busyRef.current = busy;
    transcribingRef.current = transcribing;
    recordingRef.current = recorder.recording;
  });

  // ⌘/Ctrl+J — voice capture while staying minimized. Enter (or ⌘J again)
  // finishes the clip; the panel opens compact only when the reply lands.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isVoiceToggle =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j" && !e.altKey && !e.shiftKey;
      const isSendWhileRecording = e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.altKey;

      if (isVoiceToggle) {
        e.preventDefault();
        if (busyRef.current || transcribingRef.current) return;
        if (recordingRef.current) {
          recorder.stop();
          return;
        }
        void recorder.start();
        return;
      }

      if (isSendWhileRecording && recordingRef.current) {
        e.preventDefault();
        recorder.stop();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [recorder.start, recorder.stop]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  function handleMinimize() {
    recorder.cancel();
    setOpen(false);
  }

  function handleClose() {
    recorder.cancel();
    setSize("compact");
    setOpen(false);
  }

  if (!open) {
    const label = transcribing
      ? t("agent.transcribing")
      : recorder.recording
        ? t("agent.recording")
        : activity;
    return (
      <div className="fixed bottom-5 right-5 z-50 flex max-w-[min(24rem,calc(100vw-2.5rem))] items-center gap-2">
        {label ? (
          <div className="min-w-0 rounded-full border bg-background px-3 py-2 text-xs text-muted-foreground shadow-lg">
            <p className="truncate">{label}</p>
          </div>
        ) : null}
        <Button
          size="icon"
          className={cn(
            "size-12 shrink-0 rounded-full shadow-lg",
            recorder.recording &&
              "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          )}
          onClick={() => {
            if (recorder.recording) {
              recorder.stop();
              return;
            }
            setOpen(true);
          }}
        >
          {recorder.recording ? (
            <SquareIcon className="size-3 fill-current" />
          ) : busy || transcribing ? (
            <Loader2Icon className="size-5 animate-spin" />
          ) : (
            <SparklesIcon className="size-5" />
          )}
          <span className="sr-only">
            {recorder.recording
              ? t("agent.finishRecording")
              : busy
                ? t("agent.busy")
                : t("agent.open")}
          </span>
        </Button>
      </div>
    );
  }

  return (
    <>
      {expanded ? (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-[2px]"
          aria-label={t("agent.restore")}
          onClick={() => setSize("compact")}
        />
      ) : null}
      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border bg-background shadow-xl transition-[inset,width,height,border-radius] duration-200",
          expanded
            ? "inset-3 rounded-2xl md:inset-6 md:left-[max(1.5rem,calc(50%-28rem))] md:right-[max(1.5rem,calc(50%-28rem))]"
            : "inset-x-4 bottom-5 h-[28rem] max-h-[calc(100dvh-5rem)] rounded-xl md:inset-x-auto md:right-5 md:w-96",
        )}
      >
        <header className="flex items-center gap-1 border-b px-3 py-2.5 sm:px-4 sm:py-3">
          <SparklesIcon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t("agent.title")}</span>
          {timeline.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setTimeline([])} disabled={busy}>
              {t("agent.clear")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSize(expanded ? "compact" : "expanded")}
          >
            {expanded ? <Minimize2Icon /> : <Maximize2Icon />}
            <span className="sr-only">{expanded ? t("agent.restore") : t("agent.maximize")}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleMinimize}>
            <span className="flex size-4 items-end justify-center pb-0.5" aria-hidden>
              <span className="h-0.5 w-3 rounded-full bg-current" />
            </span>
            <span className="sr-only">{t("agent.minimize")}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <XIcon />
            <span className="sr-only">{t("agent.close")}</span>
          </Button>
        </header>

        <div
          ref={scrollRef}
          className={cn(
            "flex-1 space-y-2 overflow-y-auto p-4",
            expanded && "mx-auto w-full max-w-2xl px-4 sm:px-6",
          )}
        >
          {timeline.length === 0 && (
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                <Trans
                  i18nKey="agent.intro"
                  values={{ tenant: tenant.name }}
                  components={{ strong: <strong /> }}
                />
              </p>
              {suggestionList.map((s) => (
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

          {timeline.map((item, i) => {
            if (item.kind === "user") {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm whitespace-pre-wrap text-primary-foreground">
                    {item.content}
                  </div>
                </div>
              );
            }
            if (item.kind === "assistant") {
              return (
                <div key={i} className="flex">
                  <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2">
                    <AgentMarkdown content={item.content} />
                  </div>
                </div>
              );
            }
            if (item.kind === "tool") {
              return (
                <div key={item.id} className="flex">
                  <span
                    className={cn(
                      "inline-flex max-w-[85%] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                      item.isError
                        ? "border-destructive/50 text-destructive"
                        : "border-border text-muted-foreground",
                      item.pending && "border-primary/40 text-foreground",
                    )}
                  >
                    {item.pending ? (
                      <Loader2Icon className="size-3 shrink-0 animate-spin" />
                    ) : item.isError ? (
                      <XIcon className="size-3 shrink-0" />
                    ) : (
                      <CheckIcon className="size-3 shrink-0 text-primary" />
                    )}
                    <span className="min-w-0 break-words">{item.summary}</span>
                  </span>
                </div>
              );
            }
            return (
              <div
                key={`status-${i}`}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Loader2Icon className="size-4 animate-spin" />
                {t("agent.thinking")}
              </div>
            );
          })}

          {transcribing && !busy ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              {t("agent.transcribing")}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={handleSubmit}
          className={cn(
            "flex items-end gap-2 border-t p-3",
            expanded && "mx-auto w-full max-w-2xl px-4 sm:px-6 sm:pb-4",
          )}
        >
          {recorder.recording ? (
            <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 pl-3 pr-1">
              <span className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
                <span className="size-2 animate-pulse rounded-full bg-destructive" />
                {t("agent.recording")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={recorder.cancel}
              >
                <XIcon />
                <span className="sr-only">{t("agent.cancelRecording")}</span>
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
              placeholder={transcribing ? t("agent.transcribing") : t("agent.placeholder")}
              rows={expanded ? 2 : 1}
              className={cn("min-h-9 resize-none", expanded && "min-h-14")}
              disabled={busy || transcribing}
            />
          )}

          {recorder.recording ? (
            <Button type="button" size="icon" variant="destructive" onClick={recorder.stop}>
              <SquareIcon className="size-3 fill-current" />
              <span className="sr-only">{t("agent.finishRecording")}</span>
            </Button>
          ) : text.trim() ? (
            <Button type="submit" size="icon" disabled={busy}>
              <SendIcon />
              <span className="sr-only">{t("agent.send")}</span>
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
              <span className="sr-only">{t("agent.record")}</span>
            </Button>
          )}
        </form>
      </div>
    </>
  );
}
