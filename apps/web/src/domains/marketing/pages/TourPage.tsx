import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildChapters, ChapterSection } from "../components/tour/chapter-section";
import { ClosingSection } from "../components/tour/closing-section";
import { buildRenderPillar, FoundationSection } from "../components/foundations/foundation-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

export function TourPage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.tour.title"),
    description: t("landing.seo.tour.description"),
    path: "/tour",
  });

  const lang = i18n.language;
  const chapters = useMemo(() => buildChapters(t), [t, lang]);
  const renderPillar = useMemo(() => buildRenderPillar(t), [t, lang]);

  return (
    <MarketingShell>
      <MarketingHero
        eyebrow={t("landing.tourIntro.eyebrow")}
        title={t("landing.tourIntro.title")}
        body={t("landing.tourIntro.body")}
      />

      {chapters.map((chapter, i) => (
        <ChapterSection key={chapter.id} chapter={chapter} flip={i % 2 === 1} />
      ))}

      <FoundationSection pillar={renderPillar} flip={false} />
      <ClosingSection />
    </MarketingShell>
  );
}
