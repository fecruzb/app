import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DatabaseFoundation } from "../components/foundations/database-foundation";
import {
  buildFoundations,
  buildMonorepoPillar,
  FoundationSection,
} from "../components/foundations/foundation-section";
import { I18nSection } from "../components/foundations/i18n-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { ResourceSlice } from "../components/foundations/resource-slice";
import { ThemingSection } from "../components/foundations/theming-section";
import { useReveal } from "../hooks/use-reveal";

export function FoundationsPage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.foundations.title"),
    description: t("landing.seo.foundations.description"),
    path: "/foundations",
  });

  const lang = i18n.language;
  const monorepoPillar = useMemo(() => buildMonorepoPillar(t), [t, lang]);
  const foundations = useMemo(() => buildFoundations(t), [t, lang]);

  return (
    <MarketingShell>
      <MarketingHero
        eyebrow={t("landing.foundationsIntro.eyebrow")}
        title={t("landing.foundationsIntro.title")}
        body={t("landing.foundationsIntro.body")}
      />

      {/* White after the hero fade; drop the first border-t so it doesn't cut the wash. */}
      <div className="[&>section:first-child]:border-t-0">
        <FoundationSection pillar={monorepoPillar} flip={false} />
        <DatabaseFoundation />
        <ResourceSlice />
        {foundations.map((pillar, i) => (
          <FoundationSection key={pillar.id} pillar={pillar} flip={i % 2 === 1} />
        ))}
        <ThemingSection />
        <I18nSection />
      </div>
    </MarketingShell>
  );
}
