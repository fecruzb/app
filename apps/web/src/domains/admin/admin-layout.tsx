import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftIcon,
  BoxIcon,
  Building2Icon,
  CreditCardIcon,
  MailIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@app/ui/lib/utils";
import { ThemeControls } from "@/theme/theme-controls";

export function AdminLayout() {
  const { t } = useTranslation();

  const items = [
    { to: "/admin/users", end: true, icon: UsersIcon, label: t("admin.nav.users") },
    { to: "/admin/invites", end: false, icon: MailIcon, label: t("admin.nav.invites") },
    { to: "/admin/tenants", end: false, icon: Building2Icon, label: t("admin.nav.tenants") },
    { to: "/admin/plans", end: false, icon: CreditCardIcon, label: t("admin.nav.plans") },
  ];

  return (
    <div className="flex h-svh flex-col overflow-hidden md:flex-row">
      <aside className="flex shrink-0 flex-col gap-4 border-b p-4 md:h-full md:w-64 md:border-b-0 md:border-r md:py-8">
        <div className="px-2">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-5 shrink-0 text-primary" />
            <span className="truncate">{t("admin.brand")}</span>
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
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
          <Link
            to="/app"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            {t("admin.backToApp")}
          </Link>
        </div>
      </aside>
      <main className="mx-auto min-h-0 w-full max-w-4xl flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
