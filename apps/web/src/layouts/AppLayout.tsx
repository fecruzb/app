import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { toast } from "sonner";
import { AgentFab } from "@/domains/tenant/agent-fab";
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
import { ApiError } from "@/lib/api";
import { cn } from "@app/ui/lib/utils";
import { initials } from "@/lib/utils";
import { useAppConfig } from "@/app/config";
import { ThemeControls } from "@/theme/theme-controls";
import { authApi } from "@/domains/auth/api";
import { useAuth } from "@/domains/auth/auth-provider";
import { TenantProvider, useTenant } from "@/domains/tenant/tenant-provider";

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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!me || me.user.emailVerified) return null;

  async function resend() {
    setSending(true);
    try {
      await authApi.resendVerification();
      setSent(true);
      toast.success(t("layout.verificationResent"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("layout.resendFailed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
      <MailWarningIcon className="size-4 shrink-0" />
      <span className="flex-1">{t("layout.verifyBanner")}</span>
      {!sent && (
        <Button size="sm" variant="outline" onClick={() => void resend()} disabled={sending}>
          {sending ? t("common.sending") : t("layout.resendEmail")}
        </Button>
      )}
    </div>
  );
}

function Shell() {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  const { aiEnabled } = useAppConfig();

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

  return (
    <div className="flex h-svh flex-col overflow-hidden md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b p-4 md:h-full md:w-64 md:border-b-0 md:border-r md:py-8">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <VerifyEmailBanner />
        <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* key resets the conversation when switching tenants */}
      {aiEnabled && <AgentFab key={tenant.id} />}
    </div>
  );
}

export function AppLayout() {
  return (
    <TenantProvider>
      <Shell />
    </TenantProvider>
  );
}
