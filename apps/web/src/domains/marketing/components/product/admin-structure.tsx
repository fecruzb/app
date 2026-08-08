import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { ShieldIcon } from "lucide-react";
import { points } from "@/i18n";
import { Window } from "@app/ui/browser-window";
import { MarketingHero } from "../marketing-hero";
import {
  AdminCmsMock,
  AdminFleetMock,
  AdminGrowMock,
  AdminInvitesBody,
  AdminLayerMock,
  AdminPeopleBody,
  AdminPlansBody,
  PlatformInviteEmailBody,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "../structure/database-foundation";

type CourseKey =
  | "concept"
  | "fleet"
  | "people"
  | "invites"
  | "inviteEmail"
  | "plans"
  | "cms"
  | "grow";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.adminCourse.${key}.eyebrow`),
    title: t(`landing.adminCourse.${key}.title`),
    body: t(`landing.adminCourse.${key}.body`),
    points: points(t, `landing.adminCourse.${key}.points`),
    visual,
  };
}

function InviteEmailMock() {
  const { t } = useTranslation();
  return (
    <Window label={t("landing.preview.window.inbox")}>
      <PlatformInviteEmailBody />
    </Window>
  );
}

function buildConcept(t: TFunction): DbGroup[] {
  return [
    courseBlock("concept", t, <AdminLayerMock />),
    courseBlock("fleet", t, <AdminFleetMock />),
  ];
}

function buildOps(t: TFunction): DbGroup[] {
  return [
    courseBlock(
      "people",
      t,
      <Window label="/admin/users">
        <AdminPeopleBody />
      </Window>,
    ),
    courseBlock(
      "invites",
      t,
      <Window label="/admin/invites">
        <AdminInvitesBody />
      </Window>,
    ),
    courseBlock("inviteEmail", t, <InviteEmailMock />),
    courseBlock(
      "plans",
      t,
      <Window label="/admin/plans">
        <AdminPlansBody />
      </Window>,
    ),
  ];
}

function buildGrow(t: TFunction): DbGroup[] {
  return [
    courseBlock("cms", t, <AdminCmsMock />),
    courseBlock("grow", t, <AdminGrowMock />),
  ];
}

/**
 * Product → Admin tour: platform layer above tenants — fleet, people, invites, CMS growth.
 */
export function AdminProductStructure() {
  const { t, i18n } = useTranslation();
  const concept = useMemo(() => buildConcept(t), [t, i18n.language]);
  const ops = useMemo(() => buildOps(t), [t, i18n.language]);
  const grow = useMemo(() => buildGrow(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <ShieldIcon className="size-4" />
            {t("landing.productAreas.admin.eyebrow")}
          </>
        }
        title={t("landing.productAreas.admin.title")}
        body={t("landing.productAreas.admin.body")}
      />

      {concept.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.adminCourse.parts.ops.eyebrow")}
        title={t("landing.adminCourse.parts.ops.title")}
        body={t("landing.adminCourse.parts.ops.body")}
      />

      {ops.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.adminCourse.parts.grow.eyebrow")}
        title={t("landing.adminCourse.parts.grow.title")}
        body={t("landing.adminCourse.parts.grow.body")}
      />

      {grow.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
