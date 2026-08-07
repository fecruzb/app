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
import { Badge } from "@app/ui/badge";
import { Brand } from "@app/ui/brand";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@app/ui/card";
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
import { NavItem } from "@app/ui/nav-item";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarNav } from "@app/ui/sidebar";
import { SiteHeader } from "@app/ui/site-header";
import { Textarea } from "@app/ui/textarea";
import { UserMenuButton } from "@app/ui/user-menu-button";
import { MarketingShell } from "../components/marketing-shell";
import { UiDemoBlock } from "../components/ui/ui-demo-block";
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
                  <NavItem
                    variant="sidebar"
                    active={sidebarActive === id}
                    icon={<Icon />}
                  >
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
        >
          <div className="mx-auto max-w-xs overflow-hidden rounded-xl border bg-background md:border-0">
            <Sidebar className="md:border-r">
              <SidebarHeader>
                <Brand icon={<BoxIcon className="size-5 shrink-0 text-primary" />}>
                  {t("landing.ui.demo.brandName")}
                </Brand>
              </SidebarHeader>
              <SidebarNav>
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
          </div>
        </UiDemoBlock>

        <UiDemoBlock
          title={t("landing.ui.sections.userMenu.title")}
          description={t("landing.ui.sections.userMenu.description")}
          importPath='import { UserMenuButton } from "@app/ui/user-menu-button"'
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
          title={t("landing.ui.sections.page.title")}
          description={t("landing.ui.sections.page.description")}
          importPath='import { PageHeader } from "@app/ui/page-header"'
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
