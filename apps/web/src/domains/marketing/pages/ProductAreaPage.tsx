import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react";
import {
  BotIcon,
  CreditCardIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  ShieldIcon,
} from "lucide-react";
import {
  buildProductArea,
  ChapterSection,
  type ProductAreaId,
} from "../components/product/chapter-section";
import { AgentProductStructure } from "../components/product/agent-structure";
import { TenantsProductStructure } from "../components/product/tenants-structure";
import { WorkspaceProductStructure } from "../components/product/workspace-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

const areaIcons: Record<Exclude<ProductAreaId, "account" | "tenants">, LucideIcon> = {
  auth: KeyRoundIcon,
  workspace: LayoutDashboardIcon,
  agent: BotIcon,
  billing: CreditCardIcon,
  admin: ShieldIcon,
};

const areaSeoKey: Record<Exclude<ProductAreaId, "account" | "tenants">, string> = {
  auth: "productAuth",
  workspace: "productWorkspace",
  agent: "productAgent",
  billing: "productBilling",
  admin: "productAdmin",
};

/** One Product deep-dive — compact hero + chapter FeatureSplits for that area. */
export function ProductAreaPage({ area }: { area: Exclude<ProductAreaId, "account" | "tenants"> }) {
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
/** Authenticated shell — nav, switcher, user menu, account, MCP keys. */
export function ProductWorkspacePage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.productWorkspace.title"),
    description: t("landing.seo.productWorkspace.description"),
    path: "/product/workspace",
  });
  return (
    <MarketingShell>
      <WorkspaceProductStructure />
    </MarketingShell>
  );
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

/** Account lives inside Workspace — keep old URL working. */
export function ProductAccountPage() {
  return <Navigate to="/product/workspace" replace />;
}
/** Tenants — isolation concept, schema, optional template, members & invites. */
export function ProductTenantsPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.productTenants.title"),
    description: t("landing.seo.productTenants.description"),
    path: "/product/tenants",
  });
  return (
    <MarketingShell>
      <TenantsProductStructure />
    </MarketingShell>
  );
}
export function ProductBillingPage() {
  return <ProductAreaPage area="billing" />;
}
export function ProductAdminPage() {
  return <ProductAreaPage area="admin" />;
}
