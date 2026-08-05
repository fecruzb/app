import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BoxIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  HomeIcon,
  LogOutIcon,
  MailWarningIcon,
  SettingsIcon,
  StickyNoteIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AgentFab } from "@/components/agent-fab";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, ApiError } from "@/lib/api";
import { useAppConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { TenantProvider, useTenant } from "@/providers/tenant";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/**
 * Só vira um seletor quando o usuário participa de 2+ tenants (foi convidado
 * para outros). Com um tenant só, nada aparece — o ambiente é implícito.
 */
function TenantSwitcher() {
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
        <DropdownMenuLabel>Seus tenants</DropdownMenuLabel>
        {tenants.map((t) => (
          <DropdownMenuItem key={t.id} onSelect={() => navigate(`/app/${t.slug}`)}>
            <span className="flex-1 truncate">{t.name}</span>
            {t.id === tenant.id && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const { me, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  if (!me) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md p-2 text-left text-sm hover:bg-accent">
          <Avatar>
            <AvatarFallback>{initials(me.user.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{me.user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{me.user.email}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" side="top">
        <DropdownMenuItem onSelect={() => navigate(`/app/${tenant.slug}/account`)}>
          <UserIcon /> Minha conta
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void logout().then(() => navigate("/"));
          }}
        >
          <LogOutIcon /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VerifyEmailBanner() {
  const { me } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!me || me.user.emailVerified) return null;

  async function resend() {
    setSending(true);
    try {
      await api.post("/auth/resend-verification");
      setSent(true);
      toast.success("E-mail de verificação reenviado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao reenviar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900">
      <MailWarningIcon className="size-4 shrink-0" />
      <span className="flex-1">Confirme seu e-mail para proteger sua conta.</span>
      {!sent && (
        <Button size="sm" variant="outline" onClick={() => void resend()} disabled={sending}>
          {sending ? "Enviando..." : "Reenviar e-mail"}
        </Button>
      )}
    </div>
  );
}

function navItems(slug: string) {
  return [
    { to: `/app/${slug}`, end: true, icon: HomeIcon, label: "Início" },
    { to: `/app/${slug}/notes`, end: false, icon: StickyNoteIcon, label: "Notas" },
    { to: `/app/${slug}/settings`, end: false, icon: SettingsIcon, label: "Configurações" },
  ];
}

function Shell() {
  const { tenant } = useTenant();
  const { aiEnabled } = useAppConfig();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <Link to="/" className="flex items-center gap-2 px-2 font-semibold">
          <BoxIcon className="size-5" />
          App Base
        </Link>
        <TenantSwitcher />
        <nav className="flex gap-1 md:flex-1 md:flex-col">
          {navItems(tenant.slug).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <UserMenu />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <VerifyEmailBanner />
        <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* key reinicia a conversa ao trocar de tenant */}
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
