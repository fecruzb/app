import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
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
import { Window } from "@app/ui/browser-window";
import { cn } from "@app/ui/lib/utils";

function AgentPanelChrome({
  title,
  children,
  footer,
  expanded,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  expanded?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden border bg-background shadow-xl",
        expanded ? "h-[22rem] rounded-2xl" : "h-[20rem] rounded-xl",
      )}
    >
      <header className="flex items-center gap-1 border-b px-3 py-2.5">
        <SparklesIcon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
        <span className="rounded-md px-2 py-1 text-[10px] text-muted-foreground">
          {t("landing.preview.agent.clear")}
        </span>
        <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground">
          {expanded ? <Minimize2Icon className="size-3.5" /> : <Maximize2Icon className="size-3.5" />}
        </span>
        <span className="flex size-7 items-center justify-end px-1.5" aria-hidden>
          <span className="h-0.5 w-3 rounded-full bg-muted-foreground" />
        </span>
        <span className="flex size-7 items-center justify-center rounded-md text-muted-foreground">
          <XIcon className="size-3.5" />
        </span>
      </header>
      <div className={cn("flex-1 space-y-2 overflow-hidden p-4", expanded && "px-6")}>
        {children}
      </div>
      {footer}
    </div>
  );
}

function ToolChip({
  summary,
  pending,
  isError,
}: {
  summary: string;
  pending?: boolean;
  isError?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[85%] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
        isError
          ? "border-destructive/50 text-destructive"
          : "border-border text-muted-foreground",
        pending && "border-primary/40 text-foreground",
      )}
    >
      {pending ? (
        <Loader2Icon className="size-3 shrink-0 animate-spin" />
      ) : isError ? (
        <XIcon className="size-3 shrink-0" />
      ) : (
        <CheckIcon className="size-3 shrink-0 text-primary" />
      )}
      <span className="min-w-0 break-words">{summary}</span>
    </span>
  );
}

function Composer({
  placeholder,
  mic,
  recording,
}: {
  placeholder: string;
  mic?: boolean;
  recording?: boolean;
}) {
  const { t } = useTranslation();
  if (recording) {
    return (
      <div className="flex items-end gap-2 border-t p-3">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 pl-3 pr-1">
          <span className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 animate-pulse rounded-full bg-destructive" />
            {t("landing.preview.agent.recording")}
          </span>
          <XIcon className="mr-1 size-3.5 text-muted-foreground" />
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-destructive text-destructive-foreground">
          <SquareIcon className="size-3 fill-current" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 border-t p-3">
      <div className="flex h-9 flex-1 items-center rounded-md border px-3 text-sm text-muted-foreground">
        {placeholder}
      </div>
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-md",
          mic
            ? "border text-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        {mic ? <MicIcon className="size-4" /> : <SendIcon className="size-4" />}
      </div>
    </div>
  );
}

/** Stage for FAB states — corner chrome, not position:fixed. */
function FabStage({ children }: { children: ReactNode }) {
  return (
    <Window label="app · workspace">
      <div className="relative h-56 overflow-hidden bg-muted/40">
        <div className="absolute inset-x-4 top-4 space-y-2 opacity-40">
          <div className="h-3 w-1/3 rounded bg-foreground/10" />
          <div className="h-3 w-2/3 rounded bg-foreground/10" />
          <div className="h-3 w-1/2 rounded bg-foreground/10" />
        </div>
        <div className="absolute bottom-4 right-4 flex max-w-[min(18rem,calc(100%-2rem))] items-center gap-2">
          {children}
        </div>
      </div>
    </Window>
  );
}

function FabButton({
  recording,
  busy,
}: {
  recording?: boolean;
  busy?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full shadow-lg",
        recording
          ? "bg-destructive text-destructive-foreground"
          : "bg-primary text-primary-foreground",
      )}
    >
      {recording ? (
        <SquareIcon className="size-3 fill-current" />
      ) : busy ? (
        <Loader2Icon className="size-5 animate-spin" />
      ) : (
        <SparklesIcon className="size-5" />
      )}
    </div>
  );
}

/** Full chat with separate tool chips (matches AgentFab timeline). */
export function AgentChatMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <AgentPanelChrome
        title={t("landing.preview.agent.title")}
        footer={<Composer placeholder={t("landing.preview.agent.placeholder")} />}
      >
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            {t("landing.preview.agent.suggestion")}
          </div>
        </div>
        <div className="flex">
          <ToolChip summary={t("landing.preview.agent.chip")} />
        </div>
        <div className="flex">
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
            {t("landing.preview.agent.reply")}
          </div>
        </div>
      </AgentPanelChrome>
    </Window>
  );
}

/** Tool chips: pending → done → error. */
export function AgentChipsMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <AgentPanelChrome title={t("landing.preview.agent.title")}>
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            {t("landing.preview.agent.chipsUser")}
          </div>
        </div>
        <div className="flex">
          <ToolChip summary={t("landing.preview.agent.chipPending")} pending />
        </div>
        <div className="flex">
          <ToolChip summary={t("landing.preview.agent.chipDone")} />
        </div>
        <div className="flex">
          <ToolChip summary={t("landing.preview.agent.chipError")} isError />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" />
          {t("landing.preview.agent.thinking")}
        </div>
      </AgentPanelChrome>
    </Window>
  );
}

/** Empty state with suggestion pills. */
export function AgentEmptyMock() {
  const { t } = useTranslation();
  const suggestions = [
    t("landing.preview.agent.suggestionA"),
    t("landing.preview.agent.suggestionB"),
    t("landing.preview.agent.suggestionC"),
  ];
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <AgentPanelChrome
        title={t("landing.preview.agent.title")}
        footer={<Composer placeholder={t("landing.preview.agent.placeholder")} mic />}
      >
        <p className="text-sm text-muted-foreground">{t("landing.preview.agent.intro")}</p>
        <div className="grid gap-2">
          {suggestions.map((s) => (
            <div
              key={s}
              className="rounded-md border px-3 py-2 text-left text-sm text-muted-foreground"
            >
              {s}
            </div>
          ))}
        </div>
      </AgentPanelChrome>
    </Window>
  );
}

/** FAB idle — sparkles in the corner. */
export function AgentFabIdleMock() {
  return (
    <FabStage>
      <FabButton />
    </FabStage>
  );
}

/** FAB busy — spinner + activity pill while minimized. */
export function AgentFabBusyMock() {
  const { t } = useTranslation();
  return (
    <FabStage>
      <div className="min-w-0 rounded-full border bg-background px-3 py-2 text-xs text-muted-foreground shadow-lg">
        <p className="truncate">{t("landing.preview.agent.thinking")}</p>
      </div>
      <FabButton busy />
    </FabStage>
  );
}

/** FAB recording — ⌘J voice capture while minimized. */
export function AgentFabRecordingMock() {
  const { t } = useTranslation();
  return (
    <FabStage>
      <div className="min-w-0 rounded-full border bg-background px-3 py-2 text-xs text-muted-foreground shadow-lg">
        <p className="truncate">{t("landing.preview.agent.recording")}</p>
      </div>
      <FabButton recording />
    </FabStage>
  );
}

/** In-panel mic recording bar. */
export function AgentAudioMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <AgentPanelChrome
        title={t("landing.preview.agent.title")}
        footer={<Composer placeholder="" recording />}
      >
        <p className="text-sm text-muted-foreground">{t("landing.preview.agent.audioHint")}</p>
      </AgentPanelChrome>
    </Window>
  );
}

/** Expanded near-fullscreen panel. */
export function AgentExpandedMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <div className="relative bg-background/60 p-3 backdrop-blur-[2px]">
        <AgentPanelChrome
          title={t("landing.preview.agent.title")}
          expanded
          footer={<Composer placeholder={t("landing.preview.agent.placeholder")} />}
        >
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
              {t("landing.preview.agent.suggestion")}
            </div>
          </div>
          <div className="flex">
            <ToolChip summary={t("landing.preview.agent.chip")} />
          </div>
          <div className="flex">
            <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
              {t("landing.preview.agent.reply")}
            </div>
          </div>
        </AgentPanelChrome>
      </div>
    </Window>
  );
}

/** Keyboard shortcuts card. */
export function AgentShortcutsMock() {
  const { t } = useTranslation();
  const rows = [
    { keys: "⌘ J", action: t("landing.preview.agent.shortcutVoice") },
    { keys: "Enter", action: t("landing.preview.agent.shortcutSendRec") },
    { keys: "Esc", action: t("landing.preview.agent.shortcutEsc") },
    { keys: "Enter", action: t("landing.preview.agent.shortcutSend") },
  ];
  return (
    <Window label={t("landing.preview.agent.shortcutsLabel")}>
      <div className="space-y-2 bg-card p-4">
        <p className="text-xs font-semibold">{t("landing.preview.agent.shortcutsTitle")}</p>
        <div className="divide-y rounded-lg border">
          {rows.map((row) => (
            <div
              key={`${row.keys}-${row.action}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm"
            >
              <span className="text-muted-foreground">{row.action}</span>
              <kbd className="rounded-md border bg-muted px-2 py-0.5 font-mono text-[11px]">
                {row.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">{t("landing.preview.agent.shortcutsNote")}</p>
      </div>
    </Window>
  );
}
