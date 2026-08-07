import { useTranslation } from "react-i18next";
import { DatabaseIcon, GitBranchIcon, ServerIcon } from "lucide-react";
import { brand } from "@app/shared";
import { Window } from "@app/ui/browser-window";
import { Terminal } from "@app/ui/terminal";

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
    { key: "MAIL_FROM", value: brand.defaultMailFrom, optional: true },
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

/** Local Postgres via Docker Compose — the database page opens here. */
export function PostgresMock() {
  const { t } = useTranslation();
  return (
    <Window label="docker-compose.yml">
      <div className="space-y-3 bg-card p-4 font-mono text-[11px] leading-relaxed">
        <div className="space-y-1">
          <p>
            <span className="text-primary">services</span>
            <span className="text-muted-foreground">:</span>
          </p>
          <p className="pl-2">
            <span className="text-primary">postgres</span>
            <span className="text-muted-foreground">:</span>
          </p>
          <p className="pl-4">
            <span className="text-muted-foreground">image: </span>
            <span>postgres:16</span>
          </p>
          <p className="pl-4">
            <span className="text-muted-foreground">ports: </span>
            <span>&quot;5442:5432&quot;</span>
          </p>
          <p className="pl-4">
            <span className="text-muted-foreground">POSTGRES_DB: </span>
            <span>app_base</span>
          </p>
        </div>
        <div className="rounded-md border border-dashed px-3 py-2 text-[10px]">
          <p className="text-muted-foreground">{t("landing.dbCourse.postgres.visualEnv")}</p>
          <p className="mt-1 break-all">
            <span className="text-primary">DATABASE_URL</span>
            <span className="text-muted-foreground/50">=</span>
            <span className="text-muted-foreground">
              postgres://app:app@localhost:5442/app_base
            </span>
          </p>
        </div>
      </div>
    </Window>
  );
}

/** Migration terminal — generate then apply. */
export function MigrateMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label="bash — migrations"
      lines={[
        { prompt: true, text: "npm run db:generate" },
        { text: t("landing.dbCourse.migrateFlow.visualGenerate"), muted: true },
        { prompt: true, text: "npm run db:migrate" },
        { text: t("landing.dbCourse.migrateFlow.visualMigrate"), muted: true },
        { text: t("landing.dbCourse.migrateFlow.visualDone"), muted: true },
      ]}
    />
  );
}

/** When migrations run — local setup + Render preDeploy. */
export function MigrateWhenMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label="bash — when"
      lines={[
        { prompt: true, text: "npm run setup" },
        { text: t("landing.dbCourse.migrateWhen.visualSetup"), muted: true },
        { prompt: true, text: "npm run db:migrate" },
        { text: t("landing.dbCourse.migrateWhen.visualMigrate"), muted: true },
        { text: t("landing.dbCourse.migrateWhen.visualRender"), muted: true },
        { text: t("landing.dbCourse.migrateWhen.visualSkip"), muted: true },
      ]}
    />
  );
}

/** Seed console — demo user, tenant, sample tasks. */
export function SeedMock() {
  const { t } = useTranslation();
  return (
    <Terminal
      label="bash — seed"
      lines={[
        { prompt: true, text: "npm run db:seed" },
        { text: t("landing.dbCourse.seed.visualUser"), muted: true },
        { text: t("landing.dbCourse.seed.visualTenant"), muted: true },
        { text: t("landing.dbCourse.seed.visualTasks"), muted: true },
        { text: t("landing.dbCourse.seed.visualPassword"), muted: true },
      ]}
    />
  );
}

/** A terminal window running the two commands that boot the whole stack locally. */
export function TerminalMock() {
  return (
    <Terminal
      label={`bash — ${brand.mcpServerName}`}
      lines={[
        { prompt: true, text: "npm run setup" },
        { text: "✔ docker compose up — postgres:16 on :5442", muted: true },
        { text: "✔ migrations applied — 7 tables", muted: true },
        { text: "✔ seed — demo workspace + user", muted: true },
        { prompt: true, text: "npm run dev" },
        { text: "› api    http://localhost:5000", muted: true },
        { text: "› web    http://localhost:3000", muted: true },
      ]}
    />
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
