import { useTranslation } from "react-i18next";
import { I18nSection } from "../components/foundations/i18n-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Locale files + live language switcher. */
export function StructureI18nPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureI18n.title"),
    description: t("landing.seo.structureI18n.description"),
    path: "/code/i18n",
  });

  return (
    <MarketingShell>
      <I18nSection />
    </MarketingShell>
  );
}
