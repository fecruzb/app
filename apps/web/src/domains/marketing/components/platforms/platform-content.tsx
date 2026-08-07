import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CheckSquareIcon, HomeIcon, SparklesIcon } from "lucide-react";
import { points } from "@/i18n";
import { FeatureSplit } from "../feature-split";
import { LoginBody } from "../product-preview/auth-mocks";
import { ShellBody } from "../product-preview/shell-mocks";
import { DesktopAppFrame, PhoneCascade } from "./device-frames";

export type PlatformId = "windows" | "linux" | "macos" | "ios" | "android";

function TasksPhoneBody() {
  const { t } = useTranslation();
  const items = t("landing.preview.tasks.items", { returnObjects: true }) as string[];
  const tasks = (Array.isArray(items) ? items : []).slice(0, 3);
  return (
    <div className="space-y-3 p-3 text-sm">
      <p className="text-sm font-semibold">{t("landing.preview.tasks.title")}</p>
      <div className="divide-y rounded-lg border">
        {tasks.map((title, i) => (
          <div key={title} className="flex items-center gap-2 px-2.5 py-2">
            <CheckSquareIcon
              className={`size-3.5 ${i < 2 ? "text-primary" : "text-muted-foreground"}`}
            />
            <span className={`text-[11px] ${i < 2 ? "text-muted-foreground line-through" : ""}`}>
              {title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentPhoneBody() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-64 flex-col p-3 text-sm">
      <div className="flex items-center gap-2 border-b pb-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <SparklesIcon className="size-3.5" />
        </div>
        <p className="text-xs font-semibold">{t("landing.chapters.agent.eyebrow")}</p>
      </div>
      <div className="mt-3 space-y-2">
        <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[11px] text-primary-foreground">
          {t("landing.platformsPreview.agentPrompt")}
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-bl-md border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
          {t("landing.platformsPreview.agentReply")}
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t pt-2">
        <HomeIcon className="size-3.5 text-muted-foreground" />
        <div className="h-8 flex-1 rounded-full border px-3 text-[10px] leading-8 text-muted-foreground">
          {t("landing.platformsPreview.agentPlaceholder")}
        </div>
      </div>
    </div>
  );
}

function DesktopVisual({
  variant,
  title,
}: {
  variant: "windows" | "linux" | "macos";
  title: string;
}) {
  return (
    <DesktopAppFrame title={title} variant={variant}>
      <ShellBody />
    </DesktopAppFrame>
  );
}

function MobileCascadeVisual() {
  return (
    <PhoneCascade
      front={<ShellBody compact />}
      backLeft={<LoginBody />}
      backRight={<TasksPhoneBody />}
    />
  );
}

type Section = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
};

function buildDesktopSections(id: "windows" | "linux" | "macos", t: TFunction): Section[] {
  const appTitle = t("brand");
  return [
    {
      id: "shell",
      eyebrow: t(`landing.platforms.${id}.shell.eyebrow`),
      title: t(`landing.platforms.${id}.shell.title`),
      body: t(`landing.platforms.${id}.shell.body`),
      points: points(t, `landing.platforms.${id}.shell.points`),
      visual: <DesktopVisual variant={id} title={appTitle} />,
    },
    {
      id: "build",
      eyebrow: t(`landing.platforms.${id}.build.eyebrow`),
      title: t(`landing.platforms.${id}.build.title`),
      body: t(`landing.platforms.${id}.build.body`),
      points: points(t, `landing.platforms.${id}.build.points`),
      visual: <DesktopVisual variant={id} title={appTitle} />,
    },
  ];
}

function buildMobileSections(id: "ios" | "android", t: TFunction): Section[] {
  return [
    {
      id: "shell",
      eyebrow: t(`landing.platforms.${id}.shell.eyebrow`),
      title: t(`landing.platforms.${id}.shell.title`),
      body: t(`landing.platforms.${id}.shell.body`),
      points: points(t, `landing.platforms.${id}.shell.points`),
      visual: <MobileCascadeVisual />,
    },
    {
      id: "build",
      eyebrow: t(`landing.platforms.${id}.build.eyebrow`),
      title: t(`landing.platforms.${id}.build.title`),
      body: t(`landing.platforms.${id}.build.body`),
      points: points(t, `landing.platforms.${id}.build.points`),
      visual: (
        <PhoneCascade
          front={<AgentPhoneBody />}
          backLeft={<ShellBody compact />}
          backRight={<LoginBody />}
        />
      ),
    },
  ];
}

export function buildPlatformSections(id: PlatformId, t: TFunction): Section[] {
  if (id === "ios" || id === "android") return buildMobileSections(id, t);
  return buildDesktopSections(id, t);
}

export function PlatformSection({ section, flip }: { section: Section; flip: boolean }) {
  return (
    <FeatureSplit
      density="tight"
      flip={flip}
      eyebrow={section.eyebrow}
      title={section.title}
      body={section.body}
      points={section.points}
      visual={section.visual}
      visualScale={section.id === "shell" && section.visual ? 0.9 : 0.85}
    />
  );
}

/** Hub overview FeatureSplit — Tauri story with a desktop frame. */
export function PlatformsOverviewSplit() {
  const { t } = useTranslation();
  return (
    <FeatureSplit
      density="loose"
      eyebrow={t("landing.platformsOverview.eyebrow")}
      title={t("landing.platformsOverview.title")}
      body={t("landing.platformsOverview.body")}
      points={points(t, "landing.platformsOverview.points")}
      visual={
        <DesktopAppFrame title={t("brand")} variant="macos">
          <ShellBody />
        </DesktopAppFrame>
      }
    />
  );
}
