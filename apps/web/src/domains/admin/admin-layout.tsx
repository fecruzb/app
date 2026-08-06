import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, BoxIcon, Building2Icon, CreditCardIcon, UsersIcon } from "lucide-react";
import { cn } from "@app/ui/lib/utils";
import { ThemeControls } from "@/theme/theme-controls";

export function AdminLayout() {
  const { t } = useTranslation();

  const items = [
    { to: "/admin/users", end: true, icon: UsersIcon, label: t("admin.nav.users") },
    { to: "/admin/tenants", end: false, icon: Building2Icon, label: t("admin.nav.tenants") },
    { to: "/admin/plans", end: false, icon: CreditCardIcon, label: t("admin.nav.plans") },
  ];

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col gap-4 border-b p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-2">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <BoxIcon className="size-5 text-primary" />
            {t("admin.brand")}
          </Link>
          <ThemeControls />
        </div>
        <p className="px-2 text-xs text-muted-foreground">{t("admin.subtitle")}</p>
        <nav className="flex gap-1 md:flex-1 md:flex-col">
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
        <Link
          to="/app"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {t("admin.backToApp")}
        </Link>
      </aside>
      <main className="mx-auto w-full max-w-4xl flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
