import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Building2Icon } from "lucide-react";
import { points } from "@/i18n";
import { Window } from "@app/ui/browser-window";
import { MarketingHero } from "../marketing-hero";
import {
  InviteEmailBody,
  TenantGeneralMock,
  TenantInvitesMock,
  TenantIsolationMock,
  TenantMembersMock,
  TenantOptionalMock,
  TenantSwitcherMock,
  TenantTables,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "../structure/database-foundation";

type CourseKey =
  "concept" | "model" | "optional" | "general" | "members" | "invites" | "inviteEmail" | "switcher";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.tenantsCourse.${key}.eyebrow`),
    title: t(`landing.tenantsCourse.${key}.title`),
    body: t(`landing.tenantsCourse.${key}.body`),
    points: points(t, `landing.tenantsCourse.${key}.points`),
    visual,
  };
}

function InviteEmailMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.inbox")}>
      <InviteEmailBody />
    </Window>
  );
}

function buildConcept(t: TFunction): DbGroup[] {
  return [
    courseBlock("concept", t, <TenantIsolationMock />),
    courseBlock("model", t, <TenantTables />),
    courseBlock("optional", t, <TenantOptionalMock />),
  ];
}

function buildTeam(t: TFunction): DbGroup[] {
  return [
    courseBlock("general", t, <TenantGeneralMock />),
    courseBlock("members", t, <TenantMembersMock />),
    courseBlock("invites", t, <TenantInvitesMock />),
    courseBlock("inviteEmail", t, <InviteEmailMock />),
    courseBlock("switcher", t, <TenantSwitcherMock />),
  ];
}

/**
 * Product → Tenants tour: why multi-tenancy exists, schema, optional, then team UX.
 */
export function TenantsProductStructure() {
  const { t, i18n } = useTranslation();
  const concept = useMemo(() => buildConcept(t), [t, i18n.language]);
  const team = useMemo(() => buildTeam(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <Building2Icon className="size-4" />
            {t("landing.productAreas.tenants.eyebrow")}
          </>
        }
        title={t("landing.productAreas.tenants.title")}
        body={t("landing.productAreas.tenants.body")}
      />

      {concept.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.tenantsCourse.parts.team.eyebrow")}
        title={t("landing.tenantsCourse.parts.team.title")}
        body={t("landing.tenantsCourse.parts.team.body")}
      />

      {team.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
