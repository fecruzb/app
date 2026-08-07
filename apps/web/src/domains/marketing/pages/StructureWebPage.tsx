import { useTranslation } from "react-i18next";
import { WebStructure } from "../components/structure/web-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

export function StructureWebPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureWeb.title"),
    description: t("landing.seo.structureWeb.description"),
    path: "/code/web",
  });

  return (
    <MarketingShell>
      <WebStructure />
    </MarketingShell>
  );
}
