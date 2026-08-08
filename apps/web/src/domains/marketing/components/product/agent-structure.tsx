import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { BotIcon } from "lucide-react";
import { points } from "@/i18n";
import { MarketingHero } from "../marketing-hero";
import {
  AgentAudioMock,
  AgentChatMock,
  AgentChipsMock,
  AgentEmptyMock,
  AgentExpandedMock,
  AgentFabBusyMock,
  AgentFabIdleMock,
  AgentFabRecordingMock,
  AgentShortcutsMock,
  McpCreatedKeyMock,
  McpExternalAgentMock,
  McpKeysMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "../structure/database-foundation";

type CourseKey =
  | "chat"
  | "chips"
  | "empty"
  | "fab"
  | "fabBusy"
  | "fabRecording"
  | "audio"
  | "expanded"
  | "shortcuts"
  | "mcp"
  | "mcpCreated"
  | "mcpExternal";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.agentCourse.${key}.eyebrow`),
    title: t(`landing.agentCourse.${key}.title`),
    body: t(`landing.agentCourse.${key}.body`),
    points: points(t, `landing.agentCourse.${key}.points`),
    visual,
  };
}

function buildChat(t: TFunction): DbGroup[] {
  return [
    courseBlock("chat", t, <AgentChatMock />),
    courseBlock("chips", t, <AgentChipsMock />),
    courseBlock("empty", t, <AgentEmptyMock />),
    courseBlock("expanded", t, <AgentExpandedMock />),
  ];
}

function buildFab(t: TFunction): DbGroup[] {
  return [
    courseBlock("fab", t, <AgentFabIdleMock />),
    courseBlock("fabBusy", t, <AgentFabBusyMock />),
    courseBlock("fabRecording", t, <AgentFabRecordingMock />),
    courseBlock("audio", t, <AgentAudioMock />),
    courseBlock("shortcuts", t, <AgentShortcutsMock />),
  ];
}

function buildMcp(t: TFunction): DbGroup[] {
  return [
    courseBlock("mcp", t, <McpKeysMock />),
    courseBlock("mcpCreated", t, <McpCreatedKeyMock />),
    courseBlock("mcpExternal", t, <McpExternalAgentMock />),
  ];
}

/**
 * Product → AI Agent tour: in-app chat/FAB, then MCP keys for external agents.
 */
export function AgentProductStructure() {
  const { t, i18n } = useTranslation();
  const chat = useMemo(() => buildChat(t), [t, i18n.language]);
  const fab = useMemo(() => buildFab(t), [t, i18n.language]);
  const mcp = useMemo(() => buildMcp(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <BotIcon className="size-4" />
            {t("landing.productAreas.agent.eyebrow")}
          </>
        }
        title={t("landing.productAreas.agent.title")}
        body={t("landing.productAreas.agent.body")}
      />

      {chat.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.agentCourse.parts.fab.eyebrow")}
        title={t("landing.agentCourse.parts.fab.title")}
        body={t("landing.agentCourse.parts.fab.body")}
      />

      {fab.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.agentCourse.parts.mcp.eyebrow")}
        title={t("landing.agentCourse.parts.mcp.title")}
        body={t("landing.agentCourse.parts.mcp.body")}
      />

      {mcp.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
