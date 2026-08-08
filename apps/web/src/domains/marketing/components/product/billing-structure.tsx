import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CreditCardIcon } from "lucide-react";
import { points } from "@/i18n";
import { Window } from "@app/ui/browser-window";
import { MarketingHero } from "../marketing-hero";
import {
  AdminPlansBody,
  AdminTenantsPlanBody,
  BillingGatewayMock,
  BillingInCodeMock,
  BillingModelsMock,
  BillingOptionalMock,
  PlansCatalog,
  TenantBillingMock,
  UsageTables,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "../structure/database-foundation";

type CourseKey =
  | "concept"
  | "catalog"
  | "models"
  | "adminCatalog"
  | "assign"
  | "tenantUi"
  | "usage"
  | "gateway"
  | "optional";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.billingCourse.${key}.eyebrow`),
    title: t(`landing.billingCourse.${key}.title`),
    body: t(`landing.billingCourse.${key}.body`),
    points: points(t, `landing.billingCourse.${key}.points`),
    visual,
  };
}

function buildEntitlements(t: TFunction): DbGroup[] {
  return [
    courseBlock("concept", t, <BillingInCodeMock />),
    courseBlock("catalog", t, <PlansCatalog />),
    courseBlock("models", t, <BillingModelsMock />),
  ];
}

function buildSurfaces(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "adminCatalog",
      t,
      <Window label="/admin/plans">
        <AdminPlansBody />
      </Window>,
    ),
    courseBlock(
      "assign",
      t,
      <Window label="/admin/tenants">
        <AdminTenantsPlanBody />
      </Window>,
    ),
    courseBlock("tenantUi", t, <TenantBillingMock />),
    courseBlock("usage", t, <UsageTables />),
  ];
}

function buildGateway(t: TFunction): DbGroup[] {
  return [
    courseBlock("gateway", t, <BillingGatewayMock />),
    courseBlock("optional", t, <BillingOptionalMock />),
  ];
}

/**
 * Product → Billing tour: plan catalog, charge models, tenant UI, PSP later.
 */
export function BillingProductStructure() {
  const { t, i18n } = useTranslation();
  const entitlements = useMemo(() => buildEntitlements(t), [t, i18n.language]);
  const surfaces = useMemo(() => buildSurfaces(t), [t, i18n.language]);
  const gateway = useMemo(() => buildGateway(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <CreditCardIcon className="size-4" />
            {t("landing.productAreas.billing.eyebrow")}
          </>
        }
        title={t("landing.productAreas.billing.title")}
        body={t("landing.productAreas.billing.body")}
      />

      {entitlements.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.billingCourse.parts.surfaces.eyebrow")}
        title={t("landing.billingCourse.parts.surfaces.title")}
        body={t("landing.billingCourse.parts.surfaces.body")}
      />

      {surfaces.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.billingCourse.parts.gateway.eyebrow")}
        title={t("landing.billingCourse.parts.gateway.title")}
        body={t("landing.billingCourse.parts.gateway.body")}
      />

      {gateway.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
