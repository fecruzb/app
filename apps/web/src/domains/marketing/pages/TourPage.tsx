import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { buildChapters, ChapterSection } from "../components/tour/chapter-section";
import { ClosingSection } from "../components/tour/closing-section";
import { buildRenderPillar, FoundationSection } from "../components/foundations/foundation-section";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

export function TourPage() {
  const { t, i18n } = useTranslation();
  useReveal();

  const lang = i18n.language;
  const chapters = useMemo(() => buildChapters(t), [t, lang]);
  const renderPillar = useMemo(() => buildRenderPillar(t), [t, lang]);

  return (
    <MarketingShell>
      <section className="border-b px-4 pt-20 pb-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("landing.tourIntro.eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.tourIntro.title")}
          </h1>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            {t("landing.tourIntro.body")}
          </p>
        </div>
      </section>

      {chapters.map((chapter, i) => (
        <ChapterSection key={chapter.id} chapter={chapter} flip={i % 2 === 1} />
      ))}

      <FoundationSection pillar={renderPillar} flip={false} />
      <ClosingSection />
    </MarketingShell>
  );
}
