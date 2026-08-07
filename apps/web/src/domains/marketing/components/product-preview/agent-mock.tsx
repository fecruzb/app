import { useTranslation } from "react-i18next";
import { SendIcon, SparklesIcon } from "lucide-react";
import { Window } from "./window";

export function AgentChatMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.assistant")}>
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <SparklesIcon className="size-4" />
        <span className="flex-1 text-sm font-semibold">{t("landing.preview.agent.title")}</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
            {t("landing.preview.agent.suggestion")}
          </div>
        </div>
        <div className="flex">
          <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
            {t("landing.preview.agent.reply")}
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {t("landing.preview.agent.chip")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-2 border-t p-3">
        <div className="flex h-9 flex-1 items-center rounded-md border px-3 text-sm text-muted-foreground">
          {t("landing.preview.agent.placeholder")}
        </div>
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <SendIcon className="size-4" />
        </div>
      </div>
    </Window>
  );
}

