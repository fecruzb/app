import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FoundationSection } from "../components/foundations/foundation-section";
import { BrandNavSection } from "../components/ui/brand-nav-section";
import { ControlsSection } from "../components/ui/controls-section";
import { DataPageSection } from "../components/ui/data-page-section";
import { FormOverlaySection } from "../components/ui/form-overlay-section";
import { ShellDemosSection } from "../components/ui/shell-demos-section";
import { ThemingSection } from "../components/ui/theming-section";
import { buildUiPillar } from "../components/structure/module-zooms";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** packages/ui overview, theming, then the live component catalog. */
export function StructureUiPage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureUi.title"),
    description: t("landing.seo.structureUi.description"),
    path: "/code/ui",
  });

  const ui = useMemo(() => buildUiPillar(t), [t, i18n.language]);

  return (
    <MarketingShell>
      <FoundationSection pillar={ui} flip={false} />
      <ThemingSection />
      <div className="border-t [&>section:first-child]:border-t-0">
        <BrandNavSection />
        <ShellDemosSection />
        <ControlsSection />
        <FormOverlaySection />
        <DataPageSection />
      </div>
    </MarketingShell>
  );
}
