import { useTranslation } from "react-i18next";
import { DatabaseFoundation } from "../components/structure/database-foundation";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Postgres schema groups — tables walked by domain. */
export function StructureDatabasePage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureDatabase.title"),
    description: t("landing.seo.structureDatabase.description"),
    path: "/structure/database",
  });

  return (
    <MarketingShell>
      <DatabaseFoundation />
    </MarketingShell>
  );
}
