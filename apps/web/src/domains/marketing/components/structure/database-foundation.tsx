import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { DatabaseIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { FeatureSplit } from "../feature-split";
import { MarketingHero } from "../marketing-hero";
import {
  AuthTables,
  ArticleTables,
  MigrateMock,
  MigrateWhenMock,
  PlansCatalog,
  PlatformTables,
  PostgresMock,
  SeedMock,
  TaskTable,
  TenantTables,
  UsageTables,
} from "../product-preview";
import { buildDrizzleMigrationsTree } from "./explorer-trees";
import {
  drizzleImportsFile,
  drizzleOperatorsFile,
  drizzleSelectFile,
  drizzleWritesFile,
  migrationExampleFile,
  schemaFile,
} from "./resource-snippets";

export type DbGroup = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  visual: ReactNode;
  /** Override FeatureSplit visual zoom for tall snippets. */
  visualScale?: number;
};

type CourseKey =
  | "postgres"
  | "drizzle"
  | "queryImports"
  | "querySelect"
  | "queryWrites"
  | "queryOperators"
  | "migrateFlow"
  | "migrateFiles"
  | "migrateExample"
  | "migrateWhen";
type TableKey = "identity" | "tenancy" | "billing" | "usage" | "articles" | "tasks" | "platform";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.dbCourse.${key}.eyebrow`),
    title: t(`landing.dbCourse.${key}.title`),
    body: t(`landing.dbCourse.${key}.body`),
    points: points(t, `landing.dbCourse.${key}.points`),
    visual,
  };
}

function tableBlock(key: TableKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.db.${key}.eyebrow`),
    title: t(`landing.db.${key}.title`),
    body: t(`landing.db.${key}.body`),
    points: points(t, `landing.db.${key}.points`),
    visual,
  };
}

function buildStack(t: TFunction): DbGroup[] {
  return [
    courseBlock("postgres", t, <PostgresMock />),
    courseBlock(
      "drizzle",
      t,
      <CodeBlock filename="domains/task/schema/tasks.schema.ts" code={schemaFile} />,
    ),
  ];
}

/** Schema done — one card per query topic (no carousel). */
function buildQueries(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "queryImports",
      t,
      <CodeBlock filename="repository.ts — imports" code={drizzleImportsFile} />,
    ),
    courseBlock(
      "querySelect",
      t,
      <CodeBlock filename="repository.ts — select" code={drizzleSelectFile} />,
    ),
    courseBlock(
      "queryWrites",
      t,
      <CodeBlock filename="repository.ts — writes" code={drizzleWritesFile} />,
    ),
    courseBlock(
      "queryOperators",
      t,
      <CodeBlock filename="drizzle-orm — operators" code={drizzleOperatorsFile} />,
    ),
  ];
}

/** One card each — no carousel. */
function buildMigrations(t: TFunction): DbGroup[] {
  return [
    courseBlock("migrateFlow", t, <MigrateMock />),
    courseBlock(
      "migrateFiles",
      t,
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.dbCourse.migrateFiles.workspace")}
        ariaLabel={t("landing.dbCourse.migrateFiles.aria")}
        tree={buildDrizzleMigrationsTree(t)}
      />,
    ),
    courseBlock(
      "migrateExample",
      t,
      <CodeBlock
        filename="drizzle/0008_watery_blue_blade.sql"
        code={migrationExampleFile}
        lang="sql"
      />,
    ),
    courseBlock("migrateWhen", t, <MigrateWhenMock />),
  ];
}

function buildTables(t: TFunction): DbGroup[] {
  return [
    tableBlock("identity", t, <AuthTables />),
    tableBlock("tenancy", t, <TenantTables />),
    tableBlock("billing", t, <PlansCatalog />),
    tableBlock("usage", t, <UsageTables />),
    tableBlock("articles", t, <ArticleTables />),
    tableBlock("tasks", t, <TaskTable />),
    tableBlock("platform", t, <PlatformTables />),
  ];
}

function buildSeed(t: TFunction): DbGroup {
  return {
    id: "seed",
    eyebrow: t("landing.dbCourse.seed.eyebrow"),
    title: t("landing.dbCourse.seed.title"),
    body: t("landing.dbCourse.seed.body"),
    points: points(t, "landing.dbCourse.seed.points"),
    visual: <SeedMock />,
  };
}

/**
 * Database course: Postgres → schema → queries → migrations → tables → seed.
 */
export function DatabaseFoundation() {
  const { t, i18n } = useTranslation();
  const stack = useMemo(() => buildStack(t), [t, i18n.language]);
  const queries = useMemo(() => buildQueries(t), [t, i18n.language]);
  const migrations = useMemo(() => buildMigrations(t), [t, i18n.language]);
  const tables = useMemo(() => buildTables(t), [t, i18n.language]);
  const seed = useMemo(() => buildSeed(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <DatabaseIcon className="size-4" />
            {t("landing.database.eyebrow")}
          </>
        }
        title={t("landing.database.title")}
        body={t("landing.database.body")}
      />

      {stack.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.dbCourse.parts.queries.eyebrow")}
        title={t("landing.dbCourse.parts.queries.title")}
        body={t("landing.dbCourse.parts.queries.body")}
      />

      {queries.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.dbCourse.parts.migrations.eyebrow")}
        title={t("landing.dbCourse.parts.migrations.title")}
        body={t("landing.dbCourse.parts.migrations.body")}
      />

      {migrations.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.dbCourse.parts.schema.eyebrow")}
        title={t("landing.dbCourse.parts.schema.title")}
        body={t("landing.dbCourse.parts.schema.body")}
      />

      {tables.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.dbCourse.parts.seed.eyebrow")}
        title={t("landing.dbCourse.parts.seed.title")}
        body={t("landing.dbCourse.parts.seed.body")}
      />

      <DbGroupSection group={seed} flip={flipIndex % 2 === 1} />
    </>
  );
}

export function DbGroupSection({ group, flip }: { group: DbGroup; flip: boolean }) {
  return (
    <FeatureSplit
      id={group.id}
      density="tight"
      headingAs="h4"
      flip={flip}
      eyebrow={group.eyebrow}
      title={group.title}
      body={group.body}
      points={group.points}
      visual={group.visual}
      visualScale={group.visualScale}
    />
  );
}
