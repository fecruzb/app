import { useTranslation } from "react-i18next";
import { OpenAiStructure } from "../components/structure/openai-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** OpenAI course — key gate, tool loop, platform API keys. */
export function StructureOpenaiPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.structureOpenai.title"),
    description: t("landing.seo.structureOpenai.description"),
    path: "/code/openai",
  });

  return (
    <MarketingShell>
      <OpenAiStructure />
    </MarketingShell>
  );
}
