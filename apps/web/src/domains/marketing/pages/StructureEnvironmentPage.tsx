import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  buildConfigPillar,
  buildLocalRunPillar,
  buildRenderPillar,
  FoundationSection,
} from "../components/foundations/foundation-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** .env, local run, and Render deploy — configure → run → ship. */
export function StructureEnvironmentPage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureEnvironment.title"),
    description: t("landing.seo.structureEnvironment.description"),
    path: "/code/environment",
  });

  const lang = i18n.language;
  const config = useMemo(() => buildConfigPillar(t), [t, lang]);
  const localRun = useMemo(() => buildLocalRunPillar(t), [t, lang]);
  const render = useMemo(() => buildRenderPillar(t), [t, lang]);

  return (
    <MarketingShell>
      <MarketingHero
        size="md"
        uppercaseEyebrow
        eyebrow={t("landing.structureEnvironment.eyebrow")}
        title={t("landing.structureEnvironment.title")}
        body={t("landing.structureEnvironment.body")}
      />
      <div className="[&>section:first-child]:border-t-0">
        <FoundationSection pillar={config} flip={false} />
        <FoundationSection pillar={localRun} flip />
        <FoundationSection pillar={render} flip={false} />
      </div>
    </MarketingShell>
  );
}
