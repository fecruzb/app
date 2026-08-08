import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { GlobeIcon } from "lucide-react";
import { points } from "@/i18n";
import { Terminal } from "@app/ui/terminal";
import { MarketingHero } from "../marketing-hero";
import {
  GodaddyDnsMock,
  RenderAddDomainMock,
  RenderCustomDomainsMock,
  RenderDomainDnsMock,
  RenderEnvMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "./database-foundation";

type CourseKey =
  | "overview"
  | "renderAdd"
  | "renderDns"
  | "godaddy"
  | "renderDone"
  | "env";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.domainCourse.${key}.eyebrow`),
    title: t(`landing.domainCourse.${key}.title`),
    body: t(`landing.domainCourse.${key}.body`),
    points: points(t, `landing.domainCourse.${key}.points`),
    visual,
  };
}

function buildFlow(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "overview",
      t,
      <Terminal
        label="bash — custom domain"
        lines={[
          { text: t("landing.domainCourse.overview.visual1"), muted: true },
          { text: t("landing.domainCourse.overview.visual2"), muted: true },
          { text: t("landing.domainCourse.overview.visual3"), muted: true },
          { text: t("landing.domainCourse.overview.visual4"), muted: true },
          { text: t("landing.domainCourse.overview.visual5"), muted: true },
        ]}
      />,
    ),
    courseBlock("renderAdd", t, <RenderAddDomainMock />),
    courseBlock("renderDns", t, <RenderDomainDnsMock />),
    courseBlock("godaddy", t, <GodaddyDnsMock />),
    courseBlock("renderDone", t, <RenderCustomDomainsMock />),
    courseBlock(
      "env",
      t,
      <RenderEnvMock
        keys={["APP_URL", "CORS_ORIGIN", "DATABASE_URL", "MAIL_FROM"]}
        highlight={["APP_URL", "CORS_ORIGIN"]}
        footnote={t("landing.domainCourse.env.visualFootnote")}
      />,
    ),
  ];
}

/**
 * Custom domain course: Render Add → CNAME at registrar → Verified + APP_URL.
 */
export function DomainStructure() {
  const { t, i18n } = useTranslation();
  const flow = useMemo(() => buildFlow(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <GlobeIcon className="size-4" />
            {t("landing.structureDomain.eyebrow")}
          </>
        }
        title={t("landing.structureDomain.title")}
        body={t("landing.structureDomain.body")}
      />

      {flow.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
