import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FoundationSection } from "../components/foundations/foundation-section";
import { buildWebPillar } from "../components/structure/module-zooms";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

export function StructureWebPage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureWeb.title"),
    description: t("landing.seo.structureWeb.description"),
    path: "/structure/web",
  });

  const web = useMemo(() => buildWebPillar(t), [t, i18n.language]);

  return (
    <MarketingShell>
      <FoundationSection pillar={web} flip={false} />
    </MarketingShell>
  );
}
