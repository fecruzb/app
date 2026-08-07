import { useTranslation } from "react-i18next";
import { ApiStructure } from "../components/structure/api-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

export function StructureApiPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureApi.title"),
    description: t("landing.seo.structureApi.description"),
    path: "/code/api",
  });

  return (
    <MarketingShell>
      <ApiStructure />
    </MarketingShell>
  );
}
