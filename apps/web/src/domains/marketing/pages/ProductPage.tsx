import { useTranslation } from "react-i18next";
import { ClosingSection } from "../components/tour/closing-section";
import { ProductHubLinks } from "../components/tour/product-hub-links";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Product hub — intro + cards into auth, workspace, agent, and the rest. */
export function ProductPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.tour.title"),
    description: t("landing.seo.tour.description"),
    path: "/product",
  });

  return (
    <MarketingShell>
      <MarketingHero
        size="lg"
        uppercaseEyebrow
        eyebrow={t("landing.tourIntro.eyebrow")}
        title={t("landing.tourIntro.title")}
        body={t("landing.tourIntro.body")}
      />

      <ProductHubLinks />
      <ClosingSection />
    </MarketingShell>
  );
}
