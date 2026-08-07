import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DatabaseFoundation } from "../components/foundations/database-foundation";
import {
  buildFoundations,
  buildMonorepoPillar,
  FoundationSection,
} from "../components/foundations/foundation-section";
import { I18nSection } from "../components/foundations/i18n-section";
import { MarketingShell } from "../components/marketing-shell";
import { ResourceSlice } from "../components/foundations/resource-slice";
import { ThemingSection } from "../components/foundations/theming-section";
import { useReveal } from "../hooks/use-reveal";

export function FoundationsPage() {
  const { t, i18n } = useTranslation();
  useReveal();

  const lang = i18n.language;
  const monorepoPillar = useMemo(() => buildMonorepoPillar(t), [t, lang]);
  const foundations = useMemo(() => buildFoundations(t), [t, lang]);

  return (
    <MarketingShell>
      <section className="border-b bg-muted/40 px-4 pt-20 pb-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">
            {t("landing.foundationsIntro.eyebrow")}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.foundationsIntro.title")}
          </h1>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">
            {t("landing.foundationsIntro.body")}
          </p>
        </div>
      </section>

      <div className="bg-muted/40">
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
