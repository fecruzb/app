import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  BotIcon,
  Building2Icon,
  CreditCardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldIcon,
  UserCogIcon,
} from "lucide-react";
import {
  buildProductArea,
  ChapterSection,
  type ProductAreaId,
} from "../components/product/chapter-section";
import { AgentProductStructure } from "../components/product/agent-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

const areaIcons: Record<ProductAreaId, LucideIcon> = {
  auth: KeyRoundIcon,
  workspace: LayoutDashboardIcon,
  agent: BotIcon,
  account: UserCogIcon,
  tenants: Building2Icon,
  billing: CreditCardIcon,
  admin: ShieldIcon,
};

const areaSeoKey: Record<ProductAreaId, string> = {
  auth: "productAuth",
  workspace: "productWorkspace",
  agent: "productAgent",
  account: "productAccount",
  tenants: "productTenants",
  billing: "productBilling",
  admin: "productAdmin",
};

/** One Product deep-dive — compact hero + chapter FeatureSplits for that area. */
export function ProductAreaPage({ area }: { area: ProductAreaId }) {
  const { t, i18n } = useTranslation();
  useReveal();
  const Icon = areaIcons[area];
  const seo = areaSeoKey[area];

  useDocumentMeta({
    title: t(`landing.seo.${seo}.title`),
    description: t(`landing.seo.${seo}.description`),
    path: `/product/${area}`,
  });

  const chapters = useMemo(() => buildProductArea(area, t), [area, t, i18n.language]);

  return (
    <MarketingShell>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <Icon className="size-4" />
            {t(`landing.productAreas.${area}.eyebrow`)}
          </>
        }
        title={t(`landing.productAreas.${area}.title`)}
        body={t(`landing.productAreas.${area}.body`)}
      />

      {chapters.map((chapter, i) => (
        <ChapterSection key={chapter.id} chapter={chapter} flip={i % 2 === 1} />
      ))}
    </MarketingShell>
  );
}

export function ProductAuthPage() {
  return <ProductAreaPage area="auth" />;
}
export function ProductWorkspacePage() {
  return <ProductAreaPage area="workspace" />;
}

/** AI Agent product tour — chat, chips, FAB, voice, shortcuts. */
export function ProductAgentPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.productAgent.title"),
    description: t("landing.seo.productAgent.description"),
    path: "/product/agent",
  });
  return (
    <MarketingShell>
      <AgentProductStructure />
    </MarketingShell>
  );
}

export function ProductAccountPage() {
  return <ProductAreaPage area="account" />;
}
export function ProductTenantsPage() {
  return <ProductAreaPage area="tenants" />;
}
export function ProductBillingPage() {
  return <ProductAreaPage area="billing" />;
}
export function ProductAdminPage() {
  return <ProductAreaPage area="admin" />;
}
