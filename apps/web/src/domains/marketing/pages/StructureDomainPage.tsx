import { useTranslation } from "react-i18next";
import { DomainStructure } from "../components/structure/domain-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Custom domain course — Render Custom Domains + registrar CNAME. */
export function StructureDomainPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureDomain.title"),
    description: t("landing.seo.structureDomain.description"),
    path: "/code/domain",
  });

  return (
    <MarketingShell>
      <DomainStructure />
    </MarketingShell>
  );
}
