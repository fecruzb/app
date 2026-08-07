import { useTranslation } from "react-i18next";
import { DatabaseIcon, GitBranchIcon, ServerIcon } from "lucide-react";
import { Window } from "@app/ui/browser-window";

export function EnvMock() {
  const { t } = useTranslation();
  const rows: { key: string; value: string; note?: string; optional?: boolean }[] = [
    { key: "DATABASE_URL", value: "postgres://app:app@localhost:5442/app_base" },
    { key: "APP_URL", value: "http://localhost:3000" },
    {
      key: "RESEND_API_KEY",
      value: "re_…",
      note: t("landing.preview.env.noResendNote"),
      optional: true,
    },
    { key: "MAIL_FROM", value: "App Base <onboarding@resend.dev>", optional: true },
    {
      key: "OPENAI_API_KEY",
      value: "sk-…",
      note: t("landing.preview.env.noKeyNote"),
      optional: true,
    },
    {
      key: "R2_PUBLIC_BASE_URL",
      value: "https://pub-….r2.dev",
      note: t("landing.preview.env.noR2Note"),
      optional: true,
    },
    { key: "SELF_SIGNUP_ENABLED", value: "true", optional: true },
    { key: "PLATFORM_ADMIN_EMAILS", value: t("landing.preview.sample.youEmail"), optional: true },
  ];
  return (
    <Window label=".env">
      <div className="space-y-2 bg-card p-4 font-mono text-[11px] leading-relaxed">
        {rows.map((row) => (
          <div key={row.key}>
            <div className="flex flex-wrap items-baseline gap-x-1">
              <span className="text-primary">{row.key}</span>
              <span className="text-muted-foreground/50">=</span>
              <span className="break-all text-muted-foreground">{row.value}</span>
              <span
                className={`ml-1 rounded px-1 text-[9px] ${
                  row.optional ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
                }`}
              >
                {row.optional
                  ? t("landing.preview.env.optional")
                  : t("landing.preview.env.required")}
              </span>
            </div>
            {row.note && <p className="pl-0 text-[10px] text-muted-foreground/70"># {row.note}</p>}
          </div>
        ))}
      </div>
    </Window>
  );
}

/** A terminal window running the two commands that boot the whole stack locally. */
export function TerminalMock() {
  const lines: { prompt?: boolean; text: string; muted?: boolean }[] = [
    { prompt: true, text: "npm run setup" },
    { text: "✔ docker compose up — postgres:16 on :5442", muted: true },
    { text: "✔ migrations applied — 7 tables", muted: true },
    { text: "✔ seed — demo workspace + user", muted: true },
    { prompt: true, text: "npm run dev" },
    { text: "› api    http://localhost:5000", muted: true },
    { text: "› web    http://localhost:3000", muted: true },
  ];
  return (
    <Window label="bash — app-base">
      <div className="space-y-1 bg-card p-4 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.prompt ? (
              <span className="shrink-0 text-primary">$</span>
            ) : (
              <span className="shrink-0 text-transparent">$</span>
            )}
            <span className={line.muted ? "text-muted-foreground" : ""}>{line.text}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

/** A stylized Render dashboard: the two services the blueprint provisions. */
export function RenderMock() {
  const { t } = useTranslation();
  return (
    <Window label="dashboard.render.com">
      <div className="space-y-3 bg-muted/30 p-4">
        <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <ServerIcon className="size-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">{t("landing.preview.sample.serviceApp")}</p>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.render.webService")}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> {t("landing.preview.render.live")}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <DatabaseIcon className="size-4 text-primary" />
            <div>
              <p className="text-xs font-semibold">{t("landing.preview.sample.serviceDb")}</p>
              <p className="text-[10px] text-muted-foreground">
                {t("landing.preview.render.postgres")}
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <span className="size-1.5 rounded-full bg-primary" />{" "}
            {t("landing.preview.render.available")}
          </span>
        </div>

        <div className="rounded-lg border border-dashed px-3 py-2.5 text-[10px] text-muted-foreground">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <GitBranchIcon className="size-3" /> {t("landing.preview.render.autoDeploy")}
          </p>
          <p className="mt-1">{t("landing.preview.render.preDeploy")}</p>
        </div>
      </div>
    </Window>
  );
}
