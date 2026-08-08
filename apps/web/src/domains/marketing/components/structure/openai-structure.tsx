import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { SparklesIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { MarketingHero } from "../marketing-hero";
import {
  AgentChatMock,
  OpenAiCreateKeyMock,
  OpenAiKeysMock,
  RenderEnvMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "./database-foundation";
import { buildOpenAiRepoTree } from "./explorer-trees";
import { assistantFile, openAiKeyFile, openAiLoopFile } from "./resource-snippets";

type CourseKey =
  | "overview"
  | "hasKey"
  | "loop"
  | "assistant"
  | "keys"
  | "createKey"
  | "env"
  | "chat";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.openaiCourse.${key}.eyebrow`),
    title: t(`landing.openaiCourse.${key}.title`),
    body: t(`landing.openaiCourse.${key}.body`),
    points: points(t, `landing.openaiCourse.${key}.points`),
    visual,
  };
}

function buildCode(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "overview",
      t,
      <Explorer
        title={t("landing.structureIntro.preview.explorer")}
        workspace={t("landing.openaiCourse.overview.workspace")}
        ariaLabel={t("landing.openaiCourse.overview.aria")}
        tree={buildOpenAiRepoTree(t)}
      />,
    ),
    courseBlock(
      "hasKey",
      t,
      <CodeBlock filename="integrations/openai.ts" code={openAiKeyFile} />,
    ),
    courseBlock(
      "loop",
      t,
      <CodeBlock filename="runToolLoop" code={openAiLoopFile} />,
    ),
    courseBlock(
      "assistant",
      t,
      <CodeBlock filename="agent/assistant.ts" code={assistantFile} />,
    ),
  ];
}

function buildKeys(t: TFunction): DbGroup[] {
  return [
    courseBlock("keys", t, <OpenAiKeysMock />),
    courseBlock("createKey", t, <OpenAiCreateKeyMock />),
    courseBlock(
      "env",
      t,
      <RenderEnvMock
        keys={["OPENAI_API_KEY", "ASSISTANT_MODEL", "APP_URL", "DATABASE_URL"]}
        highlight={["OPENAI_API_KEY", "ASSISTANT_MODEL"]}
        footnote={t("landing.openaiCourse.env.visualFootnote")}
      />,
    ),
    courseBlock("chat", t, <AgentChatMock />),
  ];
}

/**
 * OpenAI course: integration + key gate → platform keys → env → in-app chat.
 */
export function OpenAiStructure() {
  const { t, i18n } = useTranslation();
  const code = useMemo(() => buildCode(t), [t, i18n.language]);
  const keys = useMemo(() => buildKeys(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <SparklesIcon className="size-4" />
            {t("landing.structureOpenai.eyebrow")}
          </>
        }
        title={t("landing.structureOpenai.title")}
        body={t("landing.structureOpenai.body")}
      />

      {code.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.openaiCourse.parts.keys.eyebrow")}
        title={t("landing.openaiCourse.parts.keys.title")}
        body={t("landing.openaiCourse.parts.keys.body")}
      />

      {keys.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
