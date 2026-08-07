import { useTranslation } from "react-i18next";
import { BrandNavSection } from "../components/ui/brand-nav-section";
import { ControlsSection } from "../components/ui/controls-section";
import { DataPageSection } from "../components/ui/data-page-section";
import { FormOverlaySection } from "../components/ui/form-overlay-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { ShellDemosSection } from "../components/ui/shell-demos-section";
import { useReveal } from "../hooks/use-reveal";

export function UiPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.ui.title"),
    description: t("landing.seo.ui.description"),
    path: "/ui",
  });

  return (
    <MarketingShell>
      <MarketingHero
        eyebrow={t("landing.ui.eyebrow")}
        title={t("landing.ui.title")}
        body={t("landing.ui.body")}
      />

      {/* White after the hero fade; drop the first border-t so it doesn't cut the wash. */}
      <div className="[&>section:first-child]:border-t-0">
        <BrandNavSection />
        <ShellDemosSection />
        <ControlsSection />
        <FormOverlaySection />
        <DataPageSection />
      </div>
    </MarketingShell>
  );
}
