import { useTranslation } from "react-i18next";
import { BrandNavSection } from "../components/ui/brand-nav-section";
import { ControlsSection } from "../components/ui/controls-section";
import { DataPageSection } from "../components/ui/data-page-section";
import { FormOverlaySection } from "../components/ui/form-overlay-section";
import { useDocumentMeta } from "@/lib/document-meta";
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
      <section className="border-b bg-muted/40 px-4 pt-20 pb-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("landing.ui.eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.ui.title")}
          </h1>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">{t("landing.ui.body")}</p>
        </div>
      </section>

      <div className="bg-muted/40">
        <BrandNavSection />
        <ShellDemosSection />
        <ControlsSection />
        <FormOverlaySection />
        <DataPageSection />
      </div>
    </MarketingShell>
  );
}
