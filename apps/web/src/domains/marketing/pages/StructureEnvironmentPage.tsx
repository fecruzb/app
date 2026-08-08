import { useTranslation } from "react-i18next";
import { EnvironmentStructure } from "../components/structure/environment-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Environment course — Docker → env → run → Render. */
export function StructureEnvironmentPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureEnvironment.title"),
    description: t("landing.seo.structureEnvironment.description"),
    path: "/code/environment",
  });

  return (
    <MarketingShell>
      <EnvironmentStructure />
    </MarketingShell>
  );
}
