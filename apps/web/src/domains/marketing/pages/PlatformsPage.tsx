import { useTranslation } from "react-i18next";
import { PlatformsHubLinks } from "../components/platforms/platforms-hub-links";
import { PlatformsOverviewSplit } from "../components/platforms/platform-content";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Platforms hub — Tauri packaging overview + OS cards. */
export function PlatformsPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.platforms.title"),
    description: t("landing.seo.platforms.description"),
    path: "/platforms",
  });

  return (
    <MarketingShell>
      <MarketingHero
        size="lg"
        uppercaseEyebrow
        eyebrow={t("landing.platformsIntro.eyebrow")}
        title={t("landing.platformsIntro.title")}
        body={t("landing.platformsIntro.body")}
      />

      <div className="[&>section:first-child]:border-t-0">
        <PlatformsOverviewSplit />
        <PlatformsHubLinks />
      </div>
    </MarketingShell>
  );
}
