import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import { Apple, AppWindow, MonitorIcon, SmartphoneIcon } from "lucide-react";
import {
  buildPlatformSections,
  PlatformSection,
  type PlatformId,
} from "../components/platforms/platform-content";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

const icons: Record<PlatformId, LucideIcon> = {
  windows: AppWindow,
  linux: MonitorIcon,
  macos: Apple,
  ios: SmartphoneIcon,
  android: SmartphoneIcon,
};

const seoKey: Record<PlatformId, string> = {
  windows: "platformsWindows",
  linux: "platformsLinux",
  macos: "platformsMacos",
  ios: "platformsIos",
  android: "platformsAndroid",
};

/** One OS deep-dive — how the Tauri shell ships on that platform. */
export function PlatformAreaPage({ platform }: { platform: PlatformId }) {
  const { t, i18n } = useTranslation();
  useReveal();
  const Icon = icons[platform];

  useDocumentMeta({
    title: t(`landing.seo.${seoKey[platform]}.title`),
    description: t(`landing.seo.${seoKey[platform]}.description`),
    path: `/platforms/${platform}`,
  });

  const sections = useMemo(() => buildPlatformSections(platform, t), [platform, t, i18n.language]);

  return (
    <MarketingShell>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <Icon className="size-4" />
            {t(`landing.platforms.${platform}.eyebrow`)}
          </>
        }
        title={t(`landing.platforms.${platform}.title`)}
        body={t(`landing.platforms.${platform}.body`)}
      />

      {sections.map((section, i) => (
        <PlatformSection key={section.id} section={section} flip={i % 2 === 1} />
      ))}
    </MarketingShell>
  );
}

export function PlatformsWindowsPage() {
  return <PlatformAreaPage platform="windows" />;
}
export function PlatformsLinuxPage() {
  return <PlatformAreaPage platform="linux" />;
}
export function PlatformsMacosPage() {
  return <PlatformAreaPage platform="macos" />;
}
export function PlatformsIosPage() {
  return <PlatformAreaPage platform="ios" />;
}
export function PlatformsAndroidPage() {
  return <PlatformAreaPage platform="android" />;
}
