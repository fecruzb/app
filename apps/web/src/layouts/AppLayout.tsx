import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BoxIcon,
  CheckIcon,
  CheckSquareIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  HomeIcon,
  ImageIcon,
  LogOutIcon,
  MailWarningIcon,
  PlugIcon,
  SettingsIcon,
  ShieldIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AgentFab } from "@/domains/tenant/components/agent-fab";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Button } from "@app/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useDefaultLayout,
} from "@app/ui/resizable";
import { showApiError } from "@/lib/api";
import { cn } from "@app/ui/lib/utils";
import { initials } from "@/lib/utils";
import { useAppConfig } from "@/app/config";
import { ThemeControls } from "@/theme/theme-controls";
import { authApi } from "@/domains/auth/api";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { TenantProvider, useTenant } from "@/domains/tenant/context/tenant-provider";

/** Matches Tailwind `md:` — resize only applies on desktop. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

/**
 * Only becomes a selector when the user belongs to 2+ tenants (was invited to
 * others). With a single tenant nothing is shown — the environment is implicit.
 */
function TenantSwitcher() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const tenants = me?.tenants ?? [];
  if (tenants.length < 2) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className="truncate">{tenant.name}</span>
          <ChevronsUpDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{t("nav.yourTenants")}</DropdownMenuLabel>
        {tenants.map((tenantOption) => (
          <DropdownMenuItem
            key={tenantOption.id}
            onSelect={() => navigate(`/app/${tenantOption.slug}`)}
          >
            <span className="flex-1 truncate">{tenantOption.name}</span>
            {tenantOption.id === tenant.id && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const { me, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  if (!me) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials(me.user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{me.user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{me.user.email}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="center" side="top">
        <DropdownMenuItem onSelect={() => navigate(`/app/${tenant.slug}/account`)}>
          <UserIcon /> {t("nav.myAccount")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(`/app/${tenant.slug}/billing`)}>
          <CreditCardIcon /> {t("nav.billing")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate(`/app/${tenant.slug}/integrations`)}>
          <PlugIcon /> {t("nav.integrations")}
        </DropdownMenuItem>
        {me.user.isPlatformAdmin && (
          <DropdownMenuItem onSelect={() => navigate("/admin")}>
            <ShieldIcon /> {t("nav.admin")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void logout().then(() => navigate("/"));
          }}
        >
          <LogOutIcon /> {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VerifyEmailBanner() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const [sent, setSent] = useState(false);

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(),
    onSuccess: () => {
      setSent(true);
      toast.success(t("layout.verificationResent"));
    },
    onError: (err) => showApiError(err, t("layout.resendFailed")),
  });

  if (!me || me.user.emailVerified) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted px-4 py-2 text-sm text-foreground">
      <MailWarningIcon className="size-4 shrink-0" />
      <span className="flex-1">{t("layout.verifyBanner")}</span>
      {!sent && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => resendMutation.mutate()}
          disabled={resendMutation.isPending}
        >
          {resendMutation.isPending ? t("common.sending") : t("layout.resendEmail")}
        </Button>
      )}
    </div>
  );
}

function AppSidebar({
  items,
}: {
  items: { to: string; end: boolean; icon: LucideIcon; label: string }[];
}) {
  const { t } = useTranslation();

  return (
    <aside className="flex shrink-0 flex-col gap-4 border-b p-4 md:h-full md:min-h-0 md:border-b-0 md:py-8">
      <div className="px-2">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <BoxIcon className="size-5 shrink-0 text-primary" />
          <span className="truncate">{t("brand")}</span>
        </Link>
      </div>
      <TenantSwitcher />
      <nav className="flex gap-1 overflow-x-auto md:min-h-0 md:flex-1 md:flex-col md:overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("size-4", isActive && "text-primary")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex shrink-0 flex-col gap-2">
        <ThemeControls className="w-full px-1" menuSide="top" menuAlign="bar" />
        <UserMenu />
      </div>
    </aside>
  );
}

function AppMain() {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-y-auto">
      <VerifyEmailBanner />
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function DesktopShell({ sidebar, main }: { sidebar: ReactNode; main: ReactNode }) {
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "app-sidebar",
    storage: localStorage,
  });

  // Group always sets inline height:100% — needs a sized parent (not a fragment).
  return (
    <div className="h-svh overflow-hidden">
      <ResizablePanelGroup
        id="app-sidebar"
        orientation="horizontal"
        className="h-full"
        defaultLayout={defaultLayout}
        onLayoutChanged={onLayoutChanged}
      >
        <ResizablePanel
          id="sidebar"
          className="h-full min-h-0"
          defaultSize={256}
          minSize={200}
          maxSize={400}
        >
          {sidebar}
        </ResizablePanel>
        <ResizableHandle withHandle className="h-full" />
        <ResizablePanel id="main" className="h-full min-h-0" minSize={360}>
          {main}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

function Shell() {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  const { aiEnabled } = useAppConfig();
  const isDesktop = useIsDesktop();

  const items = [
    { to: `/app/${tenant.slug}`, end: true, icon: HomeIcon, label: t("nav.home") },
    { to: `/app/${tenant.slug}/tasks`, end: false, icon: CheckSquareIcon, label: t("nav.tasks") },
    { to: `/app/${tenant.slug}/images`, end: false, icon: ImageIcon, label: t("nav.images") },
    {
      to: `/app/${tenant.slug}/settings`,
      end: false,
      icon: SettingsIcon,
      label: t("nav.settings"),
    },
  ];

  const sidebar = <AppSidebar items={items} />;
  const main = <AppMain />;

  return (
    <>
      {isDesktop ? (
        <DesktopShell sidebar={sidebar} main={main} />
      ) : (
        <div className="flex h-svh flex-col overflow-hidden">
          {sidebar}
          {main}
        </div>
      )}

      {/* key resets the conversation when switching tenants */}
      {aiEnabled && <AgentFab key={tenant.id} />}
    </>
  );
}

export function AppLayout() {
  return (
    <TenantProvider>
      <Shell />
    </TenantProvider>
  );
}
