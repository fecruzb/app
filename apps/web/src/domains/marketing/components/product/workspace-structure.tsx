import { useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { LayoutDashboardIcon } from "lucide-react";
import { points } from "@/i18n";
import { MarketingHero } from "../marketing-hero";
import {
  PasswordMock,
  ProfileMock,
  ShellMock,
  TenantSwitcherMock,
  UserMenuMock,
} from "../product-preview";
import { DbGroupSection, type DbGroup } from "../structure/database-foundation";

type CourseKey = "shell" | "switcher" | "userMenu" | "profile" | "password";

function courseBlock(key: CourseKey, t: TFunction, visual: ReactNode): DbGroup {
  return {
    id: key,
    eyebrow: t(`landing.workspaceCourse.${key}.eyebrow`),
    title: t(`landing.workspaceCourse.${key}.title`),
    body: t(`landing.workspaceCourse.${key}.body`),
    points: points(t, `landing.workspaceCourse.${key}.points`),
    visual,
  };
}

function buildShell(t: TFunction): DbGroup[] {
  return [
    courseBlock("shell", t, <ShellMock />),
    courseBlock("switcher", t, <TenantSwitcherMock />),
    courseBlock("userMenu", t, <UserMenuMock />),
  ];
}

function buildAccount(t: TFunction): DbGroup[] {
  return [
    courseBlock("profile", t, <ProfileMock />),
    courseBlock("password", t, <PasswordMock />),
  ];
}

/**
 * Product → Workspace tour: authenticated shell, user menu / logout, account.
 * MCP API keys live on Product → AI Agent (external agents).
 */
export function WorkspaceProductStructure() {
  const { t, i18n } = useTranslation();
  const shell = useMemo(() => buildShell(t), [t, i18n.language]);
  const account = useMemo(() => buildAccount(t), [t, i18n.language]);

  let flipIndex = 0;

  return (
    <>
      <MarketingHero
        headingAs="h2"
        eyebrow={
          <>
            <LayoutDashboardIcon className="size-4" />
            {t("landing.productAreas.workspace.eyebrow")}
          </>
        }
        title={t("landing.productAreas.workspace.title")}
        body={t("landing.productAreas.workspace.body")}
      />

      {shell.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}

      <MarketingHero
        headingAs="h2"
        eyebrow={t("landing.workspaceCourse.parts.account.eyebrow")}
        title={t("landing.workspaceCourse.parts.account.title")}
        body={t("landing.workspaceCourse.parts.account.body")}
      />

      {account.map((group) => {
        const flip = flipIndex % 2 === 1;
        flipIndex += 1;
        return <DbGroupSection key={group.id} group={group} flip={flip} />;
      })}
    </>
  );
}
