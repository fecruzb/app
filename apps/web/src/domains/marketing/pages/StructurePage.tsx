import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FoundationSection } from "../components/foundations/foundation-section";
import { buildMonorepoPillar } from "../components/structure/module-zooms";
import { StructureBuildCta } from "../components/structure/structure-build-cta";
import { StructureHubLinks } from "../components/structure/structure-hub-links";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Hub: monorepo concepts + CTAs into package/platform deep-dives + build hook. */
export function StructurePage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structure.title"),
    description: t("landing.seo.structure.description"),
    path: "/code",
  });

  const monorepo = useMemo(() => buildMonorepoPillar(t), [t, i18n.language]);

  return (
    <MarketingShell>
      <MarketingHero
        size="lg"
        uppercaseEyebrow
        eyebrow={t("landing.structureIntro.eyebrow")}
        title={t("landing.structureIntro.title")}
        body={t("landing.structureIntro.body")}
      />

      <div className="[&>section:first-child]:border-t-0">
        <FoundationSection pillar={monorepo} flip={false} />
        <StructureHubLinks />
        <StructureBuildCta />
      </div>
    </MarketingShell>
  );
}
