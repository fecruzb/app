import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  isUiCategoryId,
  renderUiCategory,
  type UiCategoryId,
} from "../components/ui/ui-categories";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

const seoKey: Record<UiCategoryId, string> = {
  theming: "uiTheming",
  brand: "uiBrand",
  shells: "uiShells",
  controls: "uiControls",
  forms: "uiForms",
  overlays: "uiOverlays",
  data: "uiData",
  charts: "uiCharts",
};

/** One User Interface category — live catalog for that slice of @app/ui. */
export function UiCategoryPage({ category }: { category: UiCategoryId }) {
  const { t } = useTranslation();
  useReveal();

  useDocumentMeta({
    title: t(`landing.seo.${seoKey[category]}.title`),
    description: t(`landing.seo.${seoKey[category]}.description`),
    path: `/ui/${category}`,
  });

  return (
    <MarketingShell>
      <MarketingHero
        headingAs="h2"
        eyebrow={t(`landing.uiCategories.${category}.eyebrow`)}
        title={t(`landing.uiCategories.${category}.title`)}
        body={t(`landing.uiCategories.${category}.body`)}
      />

      <div className="border-t [&>section:first-child]:border-t-0">
        {renderUiCategory(category)}
      </div>
    </MarketingShell>
  );
}

export function UiThemingPage() {
  return <UiCategoryPage category="theming" />;
}
export function UiBrandPage() {
  return <UiCategoryPage category="brand" />;
}
export function UiShellsPage() {
  return <UiCategoryPage category="shells" />;
}
export function UiControlsPage() {
  return <UiCategoryPage category="controls" />;
}
export function UiFormsPage() {
  return <UiCategoryPage category="forms" />;
}
export function UiOverlaysPage() {
  return <UiCategoryPage category="overlays" />;
}
export function UiDataPage() {
  return <UiCategoryPage category="data" />;
}
export function UiChartsPage() {
  return <UiCategoryPage category="charts" />;
}

/** Guard for unknown `/ui/:category` segments. */
export function UiCategoryRoute({ category }: { category: string }) {
  if (!isUiCategoryId(category)) return <Navigate to="/ui" replace />;
  return <UiCategoryPage category={category} />;
}
