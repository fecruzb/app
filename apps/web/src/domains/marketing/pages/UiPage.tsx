import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FoundationSection } from "../components/foundations/foundation-section";
import { buildUiPillar } from "../components/structure/module-zooms";
import { UiHubLinks } from "../components/ui/ui-hub-links";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** User Interface hub — packages/ui overview + category cards. */
export function UiPage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.userInterface.title"),
    description: t("landing.seo.userInterface.description"),
    path: "/ui",
  });

  const ui = useMemo(() => buildUiPillar(t), [t, i18n.language]);

  return (
    <MarketingShell>
      <MarketingHero
        size="lg"
        uppercaseEyebrow
        eyebrow={t("landing.uiIntro.eyebrow")}
        title={t("landing.uiIntro.title")}
        body={t("landing.uiIntro.body")}
      />

      <div className="[&>section:first-child]:border-t-0">
        <FoundationSection pillar={ui} flip={false} />
        <UiHubLinks />
      </div>
    </MarketingShell>
  );
}
