import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BoxIcon,
  CheckSquareIcon,
  HomeIcon,
  LanguagesIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PaletteIcon,
  SettingsIcon,
  SunIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { AuthShell } from "@app/ui/auth-shell";
import { Badge } from "@app/ui/badge";
import { Brand } from "@app/ui/brand";
import { Button } from "@app/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@app/ui/card";
import { DataTable, type DataTableColumn } from "@app/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import { EmptyState } from "@app/ui/empty-state";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { NavbarShell } from "@app/ui/navbar-shell";
import { NavItem } from "@app/ui/nav-item";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@app/ui/resizable";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarNav } from "@app/ui/sidebar";
import { SidebarShell } from "@app/ui/sidebar-shell";
import { SiteHeader } from "@app/ui/site-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@app/ui/tabs";
import { Textarea } from "@app/ui/textarea";
import { UserMenuButton } from "@app/ui/user-menu-button";
import { MarketingShell } from "../components/marketing-shell";
import { UiDemoBlock } from "../components/ui/ui-demo-block";
import {
  authShellSnippet,
  avatarSnippet,
  badgeSnippet,
  brandSnippet,
  buttonSnippet,
  cardSnippet,
  dataTableSnippet,
  dialogSnippet,
  dropdownSnippet,
  formSnippet,
  iconButtonSnippet,
  navbarShellSnippet,
  navItemSnippet,
  pageSnippet,
  sidebarShellSnippet,
  sidebarSnippet,
  siteHeaderSnippet,
  tabsSnippet,
  userMenuSnippet,
} from "../components/ui/ui-snippets";
import { useReveal } from "../hooks/use-reveal";

export function UiPage() {
  const { t } = useTranslation();
  useReveal();
  const [sidebarActive, setSidebarActive] = useState<"home" | "tasks" | "settings">("home");
  const [headerActive, setHeaderActive] = useState<"foundations" | "tour" | "ui">("ui");
  const [darkDemo, setDarkDemo] = useState(false);

  return (
    <MarketingShell>
      <section className="border-b bg-muted/40 px-4 pt-20 pb-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">{t("landing.ui.eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("landing.ui.title")}
          </h1>
          <p className="mx-auto mt-3 text-pretty text-muted-foreground">{t("landing.ui.body")}</p>
        </div>
      </section>

      <div className="bg-muted/40">
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

        <UiDemoBlock
          title={t("landing.ui.sections.userMenu.title")}
          description={t("landing.ui.sections.userMenu.description")}
          importPath='import { UserMenuButton } from "@app/ui/user-menu-button"'
          filename="user-menu-button.tsx"
          code={userMenuSnippet}
        >
          <div className="max-w-xs">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <UserMenuButton
                  name={t("landing.ui.demo.userName")}
                  email={t("landing.ui.demo.userEmail")}
                  initials={t("landing.ui.demo.userInitials")}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>{t("landing.ui.demo.menuLabel")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{t("landing.ui.demo.menuItem1")}</DropdownMenuItem>
                <DropdownMenuItem>{t("landing.ui.demo.menuItem2")}</DropdownMenuItem>
                <DropdownMenuItem>{t("landing.ui.demo.menuItem3")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.iconButton.title")}
          description={t("landing.ui.sections.iconButton.description")}
          importPath='import { Button } from "@app/ui/button"'
          filename="icon-button.tsx"
          code={iconButtonSnippet}
        >
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.language")}>
              <LanguagesIcon />
            </Button>
            <Button variant="ghost" size="icon" aria-label={t("landing.ui.demo.theme")}>
              <PaletteIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("landing.ui.demo.mode")}
              onClick={() => setDarkDemo((v) => !v)}
            >
              {darkDemo ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.button.title")}
          description={t("landing.ui.sections.button.description")}
          importPath='import { Button } from "@app/ui/button"'
          filename="button.tsx"
          code={buttonSnippet}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button>{t("landing.ui.demo.default")}</Button>
              <Button variant="secondary">{t("landing.ui.demo.secondary")}</Button>
              <Button variant="outline">{t("landing.ui.demo.outline")}</Button>
              <Button variant="ghost">{t("landing.ui.demo.ghost")}</Button>
              <Button variant="destructive">{t("landing.ui.demo.destructive")}</Button>
              <Button variant="link">{t("landing.ui.demo.link")}</Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">{t("landing.ui.demo.small")}</Button>
              <Button size="default">{t("landing.ui.demo.default")}</Button>
              <Button size="lg">{t("landing.ui.demo.large")}</Button>
              <Button size="icon" aria-label={t("landing.ui.demo.more")}>
                <MoreHorizontalIcon />
              </Button>
            </div>
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.badge.title")}
          description={t("landing.ui.sections.badge.description")}
          importPath='import { Badge } from "@app/ui/badge"'
          filename="badge.tsx"
          code={badgeSnippet}
        >
          <div className="flex flex-wrap gap-2">
            <Badge>{t("landing.ui.demo.default")}</Badge>
            <Badge variant="secondary">{t("landing.ui.demo.secondary")}</Badge>
            <Badge variant="outline">{t("landing.ui.demo.outline")}</Badge>
            <Badge variant="destructive">{t("landing.ui.demo.destructive")}</Badge>
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.form.title")}
          description={t("landing.ui.sections.form.description")}
          importPath='import { Input } from "@app/ui/input"'
          filename="form.tsx"
          code={formSnippet}
        >
          <div className="mx-auto grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ui-demo-name">{t("landing.ui.demo.name")}</Label>
              <Input id="ui-demo-name" placeholder={t("landing.ui.demo.namePlaceholder")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ui-demo-notes">{t("landing.ui.demo.notes")}</Label>
              <Textarea id="ui-demo-notes" placeholder={t("landing.ui.demo.notesPlaceholder")} />
            </div>
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.card.title")}
          description={t("landing.ui.sections.card.description")}
          importPath='import { Card, CardHeader, CardTitle } from "@app/ui/card"'
          filename="card.tsx"
          code={cardSnippet}
        >
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle>{t("landing.ui.demo.cardTitle")}</CardTitle>
              <CardDescription>{t("landing.ui.demo.cardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t("landing.ui.demo.cardBody")}</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">{t("landing.ui.demo.continue")}</Button>
            </CardFooter>
          </Card>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.avatar.title")}
          description={t("landing.ui.sections.avatar.description")}
          importPath='import { Avatar, AvatarFallback } from "@app/ui/avatar"'
          filename="avatar.tsx"
          code={avatarSnippet}
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
            <Avatar className="size-10">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="size-12">
              <AvatarFallback>UI</AvatarFallback>
            </Avatar>
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.dialog.title")}
          description={t("landing.ui.sections.dialog.description")}
          importPath='import { Dialog, DialogTrigger, DialogContent } from "@app/ui/dialog"'
          filename="dialog.tsx"
          code={dialogSnippet}
        >
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{t("landing.ui.demo.openDialog")}</Button>
            </DialogTrigger>
            <DialogContent closeLabel={t("common.close")}>
              <DialogHeader>
                <DialogTitle>{t("landing.ui.demo.dialogTitle")}</DialogTitle>
                <DialogDescription>{t("landing.ui.demo.dialogDescription")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>{t("landing.ui.demo.continue")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.dropdown.title")}
          description={t("landing.ui.sections.dropdown.description")}
          importPath='import { DropdownMenu, DropdownMenuTrigger } from "@app/ui/dropdown-menu"'
          filename="dropdown-menu.tsx"
          code={dropdownSnippet}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{t("landing.ui.demo.openMenu")}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{t("landing.ui.demo.menuLabel")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("landing.ui.demo.menuItem1")}</DropdownMenuItem>
              <DropdownMenuItem>{t("landing.ui.demo.menuItem2")}</DropdownMenuItem>
              <DropdownMenuItem>{t("landing.ui.demo.menuItem3")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.tabs.title")}
          description={t("landing.ui.sections.tabs.description")}
          importPath='import { Tabs, TabsList, TabsTrigger, TabsContent } from "@app/ui/tabs"'
          filename="tabs.tsx"
          code={tabsSnippet}
        >
          <Tabs defaultValue="account" className="w-full max-w-lg">
            <TabsList>
              <TabsTrigger value="account">{t("landing.ui.demo.tabsAccount")}</TabsTrigger>
              <TabsTrigger value="security">{t("landing.ui.demo.tabsSecurity")}</TabsTrigger>
              <TabsTrigger value="billing">{t("landing.ui.demo.tabsBilling")}</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{t("landing.ui.demo.tabsAccountBody")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="ui-tabs-name">{t("landing.ui.demo.name")}</Label>
                  <Input id="ui-tabs-name" defaultValue={t("landing.ui.demo.userName")} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ui-tabs-email">{t("landing.ui.demo.tableEmail")}</Label>
                  <Input
                    id="ui-tabs-email"
                    type="email"
                    defaultValue={t("landing.ui.demo.userEmail")}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Avatar className="size-10">
                  <AvatarFallback>{t("landing.ui.demo.userInitials")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t("landing.ui.demo.userName")}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t("landing.ui.demo.userEmail")}
                  </p>
                </div>
              </div>
              <Button type="button" size="sm">
                {t("landing.ui.demo.tabsSave")}
              </Button>
            </TabsContent>
            <TabsContent value="security" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{t("landing.ui.demo.tabsSecurityBody")}</p>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ui-tabs-current">{t("landing.ui.demo.tabsCurrentPassword")}</Label>
                  <Input id="ui-tabs-current" type="password" defaultValue="••••••••" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ui-tabs-new">{t("landing.ui.demo.tabsNewPassword")}</Label>
                  <Input id="ui-tabs-new" type="password" placeholder="••••••••" />
                </div>
              </div>
              <Button type="button" size="sm" variant="outline">
                {t("landing.ui.demo.tabsUpdatePassword")}
              </Button>
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">{t("landing.ui.demo.tabsSessionsTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("landing.ui.demo.tabsSessionsBody")}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="billing" className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{t("landing.ui.demo.tabsBillingBody")}</p>
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{t("landing.ui.demo.tabsPlanTitle")}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("landing.ui.demo.tabsPlanBody")}
                    </p>
                  </div>
                  <Badge variant="secondary">{t("landing.ui.demo.tableRoleOwner")}</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t("landing.ui.demo.tabsPlanSeats")}</p>
                    <p className="mt-0.5 text-sm font-medium">
                      {t("landing.ui.demo.tabsPlanSeatsValue")}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{t("landing.ui.demo.tabsPlanUsage")}</p>
                    <p className="mt-0.5 text-sm font-medium">
                      {t("landing.ui.demo.tabsPlanUsageValue")}
                    </p>
                  </div>
                </div>
              </div>
              <Button type="button" size="sm">
                {t("landing.ui.demo.tabsManagePlan")}
              </Button>
            </TabsContent>
          </Tabs>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.dataTable.title")}
          description={t("landing.ui.sections.dataTable.description")}
          importPath='import { DataTable } from "@app/ui/data-table"'
          filename="data-table.tsx"
          code={dataTableSnippet}
        >
          <DemoDataTable />
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.page.title")}
          description={t("landing.ui.sections.page.description")}
          importPath='import { PageHeader } from "@app/ui/page-header"'
          filename="page.tsx"
          code={pageSnippet}
        >
          <div className="space-y-6">
            <PageHeader
              title={t("landing.ui.demo.pageTitle")}
              description={t("landing.ui.demo.pageDescription")}
            />
            <EmptyState>{t("landing.ui.demo.empty")}</EmptyState>
            <div className="rounded-lg border border-dashed p-4">
              <PageLoading />
            </div>
          </div>
        </UiDemoBlock>
      </div>
    </MarketingShell>
  );
}

type DemoMember = {
  id: string;
  name: string;
  email: string;
  roleKey: "owner" | "admin" | "member";
};

const DEMO_MEMBERS: DemoMember[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", roleKey: "owner" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", roleKey: "admin" },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", roleKey: "member" },
  { id: "4", name: "Katherine Johnson", email: "katherine@example.com", roleKey: "member" },
  { id: "5", name: "Margaret Hamilton", email: "margaret@example.com", roleKey: "admin" },
  { id: "6", name: "Tim Berners-Lee", email: "tim@example.com", roleKey: "member" },
  { id: "7", name: "Linus Torvalds", email: "linus@example.com", roleKey: "member" },
  { id: "8", name: "Barbara Liskov", email: "barbara@example.com", roleKey: "admin" },
];

function DemoDataTable() {
  const { t } = useTranslation();

  const columns: DataTableColumn<DemoMember>[] = [
    {
      id: "name",
      header: t("landing.ui.demo.tableName"),
      sortValue: (row) => row.name,
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      id: "email",
      header: t("landing.ui.demo.tableEmail"),
      sortValue: (row) => row.email,
      cell: (row) => <span className="text-muted-foreground">{row.email}</span>,
    },
    {
      id: "role",
      header: t("landing.ui.demo.tableRole"),
      sortValue: (row) => row.roleKey,
      cell: (row) => (
        <Badge variant="secondary">
          {t(
            row.roleKey === "owner"
              ? "landing.ui.demo.tableRoleOwner"
              : row.roleKey === "admin"
                ? "landing.ui.demo.tableRoleAdmin"
                : "landing.ui.demo.tableRoleMember",
          )}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={DEMO_MEMBERS}
      getRowId={(row) => row.id}
      pageSize={5}
      pagination={{
        previousLabel: t("landing.ui.demo.tablePrevious"),
        nextLabel: t("landing.ui.demo.tableNext"),
        pageLabel: (page, pages) => t("landing.ui.demo.tablePage", { page, pages }),
      }}
      empty={<EmptyState>{t("landing.ui.demo.tableEmpty")}</EmptyState>}
    />
  );
}
