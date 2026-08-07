import { useTranslation } from "react-i18next";
import { ThemingSection } from "../components/foundations/theming-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

export function FoundationsPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.foundations.title"),
    description: t("landing.seo.foundations.description"),
    path: "/foundations",
  });

  return (
    <MarketingShell>
      <MarketingHero
        size="lg"
        uppercaseEyebrow
        eyebrow={t("landing.foundationsIntro.eyebrow")}
        title={t("landing.foundationsIntro.title")}
        body={t("landing.foundationsIntro.body")}
      />

      <div className="[&>section:first-child]:border-t-0">
        <ThemingSection />
      </div>
    </MarketingShell>
  );
}
