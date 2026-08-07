import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BoxIcon,
  CheckSquareIcon,
  HomeIcon,
  LanguagesIcon,
  PaletteIcon,
  SettingsIcon,
} from "lucide-react";
import { Brand } from "@app/ui/brand";
import { Button } from "@app/ui/button";
import { NavItem } from "@app/ui/nav-item";
import { SiteHeader } from "@app/ui/site-header";
import { UiDemoBlock } from "./ui-demo-block";
import { brandSnippet, navItemSnippet, siteHeaderSnippet } from "./ui-snippets";

/** Brand, NavItem, and SiteHeader demos. */
export function BrandNavSection() {
  const { t } = useTranslation();
  const [sidebarActive, setSidebarActive] = useState<"home" | "tasks" | "settings">("home");
  const [headerActive, setHeaderActive] = useState<"foundations" | "tour" | "ui">("ui");

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.brand.title")}
        description={t("landing.ui.sections.brand.description")}
        importPath='import { Brand } from "@app/ui/brand"'
        filename="brand.tsx"
        code={brandSnippet}
      >
        <div className="flex flex-wrap items-start gap-8">
          <Brand icon={<BoxIcon className="size-5 text-primary" />}>
            {t("landing.ui.demo.brandName")}
          </Brand>
          <Brand
            icon={<BoxIcon className="size-5 shrink-0 text-primary" />}
            subtitle={t("landing.ui.demo.brandSubtitle")}
          >
            {t("landing.ui.demo.brandName")}
          </Brand>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.navItem.title")}
        description={t("landing.ui.sections.navItem.description")}
        importPath='import { NavItem } from "@app/ui/nav-item"'
        filename="nav-item.tsx"
        code={navItemSnippet}
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["foundations", t("landing.ui.demo.navFoundations")],
                ["tour", t("landing.ui.demo.navTour")],
                ["ui", t("landing.ui.demo.navUi")],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setHeaderActive(id)}>
                <NavItem variant="header" active={headerActive === id}>
                  {label}
                </NavItem>
              </button>
            ))}
          </div>
          <div className="flex max-w-xs flex-col gap-1">
            {(
              [
                ["home", HomeIcon, t("landing.ui.demo.navHome")],
                ["tasks", CheckSquareIcon, t("landing.ui.demo.navTasks")],
                ["settings", SettingsIcon, t("landing.ui.demo.navSettings")],
              ] as const
            ).map(([id, Icon, label]) => (
              <button key={id} type="button" onClick={() => setSidebarActive(id)}>
                <NavItem variant="sidebar" active={sidebarActive === id} icon={<Icon />}>
                  {label}
                </NavItem>
              </button>
            ))}
          </div>
        </div>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.siteHeader.title")}
        description={t("landing.ui.sections.siteHeader.description")}
        importPath='import { SiteHeader } from "@app/ui/site-header"'
        filename="site-header.tsx"
        code={siteHeaderSnippet}
      >
        <div className="overflow-hidden rounded-xl border">
          <SiteHeader
            className="static"
            brand={
              <Brand icon={<BoxIcon className="size-5 text-primary" />}>
                {t("landing.ui.demo.brandName")}
              </Brand>
            }
            nav={
              <>
                <NavItem variant="header" active={false}>
                  {t("landing.ui.demo.navFoundations")}
                </NavItem>
                <NavItem variant="header" active={false}>
                  {t("landing.ui.demo.navTour")}
                </NavItem>
                <NavItem variant="header" active>
                  {t("landing.ui.demo.navUi")}
                </NavItem>
              </>
            }
            actions={
              <>
                <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.language")}>
                  <LanguagesIcon />
                </Button>
                <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.theme")}>
                  <PaletteIcon />
                </Button>
                <Button variant="ghost" size="sm">
                  {t("landing.ui.demo.headerActions")}
                </Button>
              </>
            }
          />
        </div>
      </UiDemoBlock>
    </>
  );
}
