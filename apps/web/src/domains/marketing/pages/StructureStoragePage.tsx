import { useTranslation } from "react-i18next";
import { StorageStructure } from "../components/structure/storage-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Storage course — MediaStore → local disk → Cloudflare R2. */
export function StructureStoragePage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureStorage.title"),
    description: t("landing.seo.structureStorage.description"),
    path: "/code/storage",
  });

  return (
    <MarketingShell>
      <StorageStructure />
    </MarketingShell>
  );
}
