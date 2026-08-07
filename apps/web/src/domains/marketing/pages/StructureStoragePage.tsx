import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  buildStoragePillar,
  FoundationSection,
} from "../components/foundations/foundation-section";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** MediaStore + Cloudflare R2 (local disk fallback). */
export function StructureStoragePage() {
  const { t, i18n } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureStorage.title"),
    description: t("landing.seo.structureStorage.description"),
    path: "/structure/storage",
  });

  const storage = useMemo(() => buildStoragePillar(t), [t, i18n.language]);

  return (
    <MarketingShell>
      <FoundationSection pillar={storage} flip={false} />
    </MarketingShell>
  );
}
