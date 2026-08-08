import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CloudIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { Terminal } from "@app/ui/terminal";
import { MarketingHero } from "../marketing-hero";
import {
  EnvMock,
  PostgresMock,
  RenderBlueprintMock,
  RenderEnvMock,
  RenderMock,
  TerminalMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "./database-foundation";
import { buildEnvRepoTree } from "./explorer-trees";
import { envSchemaFile, renderSecretsFile, renderYamlFile } from "./resource-snippets";

type CourseKey =
  | "overview"
  | "docker"
  | "env"
  | "envSchema"
  | "run"
  | "renderYaml"
  | "renderConnect"
  | "renderDeploy"
  | "renderEnv"
  | "secrets"
  | "runtime";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.envCourse.${key}.eyebrow`),
    title: t(`landing.envCourse.${key}.title`),
    body: t(`landing.envCourse.${key}.body`),
    points: points(t, `landing.envCourse.${key}.points`),
    visual,
  };
}

function buildLocal(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "overview",
      t,
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.envCourse.overview.workspace")}
        ariaLabel={t("landing.envCourse.overview.aria")}
        tree={buildEnvRepoTree(t)}
      />,
    ),
    courseBlock("docker", t, <PostgresMock />),
    courseBlock("env", t, <EnvMock />),
    courseBlock(
      "envSchema",
      t,
      <CodeBlock filename="apps/api/src/lib/env.ts" code={envSchemaFile} />,
    ),
    courseBlock("run", t, <TerminalMock />),
  ];
}

function buildShip(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "renderYaml",
      t,
      <CodeBlock filename="render.yaml" code={renderYamlFile} lang="yaml" />,
    ),
    courseBlock("renderConnect", t, <RenderBlueprintMock />),
    courseBlock("renderDeploy", t, <RenderMock />),
    courseBlock("renderEnv", t, <RenderEnvMock />),
    courseBlock(
      "secrets",
      t,
      <CodeBlock filename="secrets · sync: false" code={renderSecretsFile} lang="yaml" />,
    ),
    courseBlock(
      "runtime",
      t,
      <Terminal
        label="bash — runtime"
        lines={[
          { prompt: true, text: "grep runtime render.yaml" },
          { text: t("landing.envCourse.runtime.visualRuntime"), muted: true },
          { prompt: true, text: "ls Dockerfile" },
          { text: t("landing.envCourse.runtime.visualNoDocker"), muted: true },
          { prompt: true, text: "npm run db:up" },
          { text: t("landing.envCourse.runtime.visualCompose"), muted: true },
        ]}
      />,
    ),
  ];
}

/**
 * Environment course: map → Docker → env → run → Render → secrets → runtime.
 */
export function EnvironmentStructure() {
  const { t, i18n } = useTranslation();
  const local = useMemo(() => buildLocal(t), [t, i18n.language]);
  const ship = useMemo(() => buildShip(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <CloudIcon className="size-4" />
            {t("landing.structureEnvironment.eyebrow")}
          </>
        }
        title={t("landing.structureEnvironment.title")}
        body={t("landing.structureEnvironment.body")}
      />

      {local.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.envCourse.parts.ship.eyebrow")}
        title={t("landing.envCourse.parts.ship.title")}
        body={t("landing.envCourse.parts.ship.body")}
      />

      {ship.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
