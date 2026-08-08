import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { KeyRoundIcon } from "lucide-react";
import {
  buildProductArea,
  ChapterSection,
} from "../components/product/chapter-section";
import { AdminProductStructure } from "../components/product/admin-structure";
import { AgentProductStructure } from "../components/product/agent-structure";
import { BillingProductStructure } from "../components/product/billing-structure";
import { TenantsProductStructure } from "../components/product/tenants-structure";
import { WorkspaceProductStructure } from "../components/product/workspace-structure";
import { useDocumentMeta } from "@/lib/document-meta";
import { MarketingHero } from "../components/marketing-hero";
import { MarketingShell } from "../components/marketing-shell";
import { useReveal } from "../hooks/use-reveal";

/** Thin chapter page — Auth only; other Product areas use dedicated course structures. */
export function ProductAreaPage({ area }: { area: "auth" }) {
  const { t, i18n } = useTranslation();
  useReveal();

  useDocumentMeta({
    title: t("landing.seo.productAuth.title"),
    description: t("landing.seo.productAuth.description"),
    path: "/product/auth",
  });

  const chapters = useMemo(() => buildProductArea(area, t), [area, t, i18n.language]);

  return (
    <MarketingShell>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <KeyRoundIcon className="size-4" />
            {t("landing.productAreas.auth.eyebrow")}
          </>
        }
        title={t("landing.productAreas.auth.title")}
        body={t("landing.productAreas.auth.body")}
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
/** Billing — plan catalog, charge models, tenant UI, PSP later. */
export function ProductBillingPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.productBilling.title"),
    description: t("landing.seo.productBilling.description"),
    path: "/product/billing",
  });
  return (
    <MarketingShell>
      <BillingProductStructure />
    </MarketingShell>
  );
}
/** Admin — platform layer above tenants: fleet, people, invites, CMS growth. */
export function ProductAdminPage() {
  const { t } = useTranslation();
  useReveal();
  useDocumentMeta({
    title: t("landing.seo.productAdmin.title"),
    description: t("landing.seo.productAdmin.description"),
    path: "/product/admin",
  });
  return (
    <MarketingShell>
      <AdminProductStructure />
    </MarketingShell>
  );
}
