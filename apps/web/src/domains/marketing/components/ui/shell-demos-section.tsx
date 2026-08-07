import { useTranslation } from "react-i18next";
import {
  BoxIcon,
  CheckSquareIcon,
  HomeIcon,
  LanguagesIcon,
  MoonIcon,
  PaletteIcon,
  SettingsIcon,
} from "lucide-react";
import { AuthShell } from "@app/ui/auth-shell";
import { Brand } from "@app/ui/brand";
import { Button } from "@app/ui/button";
import { NavbarShell } from "@app/ui/navbar-shell";
import { NavItem } from "@app/ui/nav-item";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@app/ui/resizable";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarNav } from "@app/ui/sidebar";
import { SidebarShell } from "@app/ui/sidebar-shell";
import { UserMenuButton } from "@app/ui/user-menu-button";
import { UiDemoBlock } from "./ui-demo-block";
import {
  authShellSnippet,
  navbarShellSnippet,
  sidebarShellSnippet,
  sidebarSnippet,
} from "./ui-snippets";

/** Sidebar, SidebarShell, NavbarShell, and AuthShell demos. */
export function ShellDemosSection() {
  const { t } = useTranslation();

  return (
    <>
      <UiDemoBlock
        title={t("landing.ui.sections.sidebar.title")}
        description={t("landing.ui.sections.sidebar.description")}
        importPath='import { Sidebar, SidebarHeader, SidebarNav, SidebarFooter } from "@app/ui/sidebar"'
        filename="sidebar.tsx"
        code={sidebarSnippet}
        previewClassName="h-[28rem] overflow-hidden p-0"
      >
        <ResizablePanelGroup id="ui-demo-sidebar" orientation="horizontal" className="h-full">
          <ResizablePanel
            id="sidebar"
            className="h-full min-h-0"
            defaultSize={180}
            minSize={140}
            maxSize={260}
          >
            <Sidebar className="h-full border-b-0 py-6">
              <SidebarHeader>
                <Brand icon={<BoxIcon className="size-5 shrink-0 text-primary" />}>
                  {t("landing.ui.demo.brandName")}
                </Brand>
              </SidebarHeader>
              <SidebarNav className="min-h-0 flex-1 flex-col overflow-y-auto">
                <NavItem variant="sidebar" active icon={<HomeIcon />}>
                  {t("landing.ui.demo.navHome")}
                </NavItem>
                <NavItem variant="sidebar" icon={<CheckSquareIcon />}>
                  {t("landing.ui.demo.navTasks")}
                </NavItem>
                <NavItem variant="sidebar" icon={<SettingsIcon />}>
                  {t("landing.ui.demo.navSettings")}
                </NavItem>
              </SidebarNav>
              <SidebarFooter>
                <div className="flex justify-center gap-0.5 px-1">
                  <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.language")}>
                    <LanguagesIcon />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.theme")}>
                    <PaletteIcon />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.mode")}>
                    <MoonIcon />
                  </Button>
                </div>
                <UserMenuButton
                  name={t("landing.ui.demo.userName")}
                  email={t("landing.ui.demo.userEmail")}
                  initials={t("landing.ui.demo.userInitials")}
                />
              </SidebarFooter>
            </Sidebar>
          </ResizablePanel>
          <ResizableHandle withHandle className="h-full" />
          <ResizablePanel id="main" className="h-full min-h-0 bg-muted/40" minSize={120} />
        </ResizablePanelGroup>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.sidebarShell.title")}
        description={t("landing.ui.sections.sidebarShell.description")}
        importPath='import { SidebarShell } from "@app/ui/sidebar-shell"'
        filename="sidebar-shell.tsx"
        code={sidebarShellSnippet}
        browserLabel="/app/acme"
        previewClassName="h-[26rem]"
      >
        <SidebarShell
          className="h-full"
          mainClassName="max-w-none"
          resizable={{
            id: "ui-demo-sidebar-shell",
            defaultSize: 180,
            minSize: 140,
            maxSize: 260,
            mainMinSize: 120,
          }}
          sidebar={
            <Sidebar className="h-full border-b-0 py-6">
              <SidebarHeader>
                <Brand icon={<BoxIcon className="size-5 shrink-0 text-primary" />}>
                  {t("landing.ui.demo.brandName")}
                </Brand>
              </SidebarHeader>
              <SidebarNav className="min-h-0 flex-1 flex-col overflow-y-auto">
                <NavItem variant="sidebar" active icon={<HomeIcon />}>
                  {t("landing.ui.demo.navHome")}
                </NavItem>
                <NavItem variant="sidebar" icon={<CheckSquareIcon />}>
                  {t("landing.ui.demo.navTasks")}
                </NavItem>
                <NavItem variant="sidebar" icon={<SettingsIcon />}>
                  {t("landing.ui.demo.navSettings")}
                </NavItem>
              </SidebarNav>
              <SidebarFooter>
                <UserMenuButton
                  name={t("landing.ui.demo.userName")}
                  email={t("landing.ui.demo.userEmail")}
                  initials={t("landing.ui.demo.userInitials")}
                />
              </SidebarFooter>
            </Sidebar>
          }
        >
          <h1 className="text-lg font-semibold tracking-tight">
            {t("landing.ui.demo.shellHomeTitle")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("landing.ui.demo.shellHomeBody")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <CheckSquareIcon className="size-3.5 text-muted-foreground" />
                {t("landing.ui.demo.navTasks")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("landing.ui.demo.shellHomeTasksHint")}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <SettingsIcon className="size-3.5 text-muted-foreground" />
                {t("landing.ui.demo.navSettings")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("landing.ui.demo.shellHomeSettingsHint")}
              </p>
            </div>
          </div>
        </SidebarShell>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.navbarShell.title")}
        description={t("landing.ui.sections.navbarShell.description")}
        importPath='import { NavbarShell } from "@app/ui/navbar-shell"'
        filename="navbar-shell.tsx"
        code={navbarShellSnippet}
        browserLabel="/"
      >
        <NavbarShell
          className="min-h-0"
          headerClassName="static"
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
            <Button variant="ghost" size="sm">
              {t("landing.ui.demo.headerActions")}
            </Button>
          }
          footer={
            <footer className="border-t">
              <div className="mx-auto flex h-12 w-full max-w-5xl items-center justify-between px-4 text-xs text-muted-foreground">
                <span>{t("landing.footer.copyright", { year: new Date().getFullYear() })}</span>
                <span>{t("landing.footer.builtWith")}</span>
              </div>
            </footer>
          }
        >
          <section className="mx-auto max-w-md px-6 py-12 text-center">
            <p className="text-xs font-medium text-primary">{t("landing.ui.eyebrow")}</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
              {t("landing.ui.title")}
            </h1>
            <p className="mt-3 text-sm text-pretty text-muted-foreground">
              {t("landing.ui.body")}
            </p>
            <Button className="mt-6" size="sm">
              {t("landing.teasers.exploreUi")}
            </Button>
          </section>
        </NavbarShell>
      </UiDemoBlock>

      <UiDemoBlock
        title={t("landing.ui.sections.authShell.title")}
        description={t("landing.ui.sections.authShell.description")}
        importPath='import { AuthShell } from "@app/ui/auth-shell"'
        filename="auth-shell.tsx"
        code={authShellSnippet}
        browserLabel="/login"
      >
        <AuthShell
          className="min-h-0 py-10"
          brand={
            <Brand icon={<BoxIcon className="size-5 text-primary" />}>
              {t("landing.ui.demo.brandName")}
            </Brand>
          }
          title={t("landing.ui.demo.authTitle")}
          description={t("landing.ui.demo.authDescription")}
          footer={t("landing.ui.demo.authFooter")}
        >
          <div className="rounded-md border border-dashed px-3 py-8 text-center font-mono text-xs text-muted-foreground">
            {"<Outlet />"}
          </div>
        </AuthShell>
      </UiDemoBlock>
    </>
  );
}
