import { useTranslation } from "react-i18next";
import { ResendStructure } from "../components/structure/resend-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Resend course — sendEmail, API keys, verified domains. */
export function StructureResendPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureResend.title"),
    description: t("landing.seo.structureResend.description"),
    path: "/code/resend",
  });

  return (
    <MarketingShell>
      <ResendStructure />
    </MarketingShell>
  );
}
