import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { MailIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { Window } from "@app/ui/browser-window";
import { MarketingHero } from "../marketing-hero";
import {
  InviteEmailBody,
  RenderEnvMock,
  ResendCreateKeyMock,
  ResendDomainDetailMock,
  ResendDomainsMock,
  ResendKeysMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "./database-foundation";
import { buildResendRepoTree } from "./explorer-trees";
import { resendLayoutFile, resendSendFile } from "./resource-snippets";

type CourseKey =
  | "overview"
  | "send"
  | "layout"
  | "keys"
  | "createKey"
  | "domains"
  | "domainDetail"
  | "env"
  | "inbox";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.resendCourse.${key}.eyebrow`),
    title: t(`landing.resendCourse.${key}.title`),
    body: t(`landing.resendCourse.${key}.body`),
    points: points(t, `landing.resendCourse.${key}.points`),
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
        workspace={t("landing.resendCourse.overview.workspace")}
        ariaLabel={t("landing.resendCourse.overview.aria")}
        tree={buildResendRepoTree(t)}
      />,
    ),
    courseBlock(
      "send",
      t,
      <CodeBlock filename="integrations/resend.ts" code={resendSendFile} />,
    ),
    courseBlock(
      "layout",
      t,
      <CodeBlock filename="lib/email.ts" code={resendLayoutFile} />,
    ),
  ];
}

function buildDashboard(t: TFunction): DbGroup[] {
  return [
    courseBlock("keys", t, <ResendKeysMock />),
    courseBlock("createKey", t, <ResendCreateKeyMock />),
    courseBlock("domains", t, <ResendDomainsMock />),
    courseBlock("domainDetail", t, <ResendDomainDetailMock />),
    courseBlock(
      "env",
      t,
      <RenderEnvMock
        keys={["RESEND_API_KEY", "MAIL_FROM", "APP_URL", "DATABASE_URL"]}
        highlight={["RESEND_API_KEY", "MAIL_FROM"]}
        footnote={t("landing.resendCourse.env.visualFootnote")}
      />,
    ),
    courseBlock(
      "inbox",
      t,
      <Window label={t("landing.preview.window.inbox")}>
        <InviteEmailBody />
      </Window>,
    ),
  ];
}

/**
 * Resend course: sendEmail → dashboard keys/domains → env → sample inbox.
 */
export function ResendStructure() {
  const { t, i18n } = useTranslation();
  const code = useMemo(() => buildCode(t), [t, i18n.language]);
  const dashboard = useMemo(() => buildDashboard(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <MailIcon className="size-4" />
            {t("landing.structureResend.eyebrow")}
          </>
        }
        title={t("landing.structureResend.title")}
        body={t("landing.structureResend.body")}
      />

      {code.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.resendCourse.parts.dashboard.eyebrow")}
        title={t("landing.resendCourse.parts.dashboard.title")}
        body={t("landing.resendCourse.parts.dashboard.body")}
      />

      {dashboard.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
