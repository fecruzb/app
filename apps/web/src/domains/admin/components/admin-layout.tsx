import { Link, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, Building2Icon, CreditCardIcon, MailIcon, UsersIcon } from "lucide-react";
import { AppLogo } from "@/brand/logo";
import { Brand } from "@app/ui/brand";
import { NavItem } from "@app/ui/nav-item";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarNav } from "@app/ui/sidebar";
import { SidebarShell } from "@app/ui/sidebar-shell";
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
    <SidebarShell
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Link to="/admin">
              <Brand icon={<AppLogo />} subtitle={t("admin.subtitle")}>
                {t("admin.brand")}
              </Brand>
            </Link>
          </SidebarHeader>
          <SidebarNav>
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {({ isActive }) => (
                  <NavItem variant="sidebar" active={isActive} icon={<item.icon />}>
                    {item.label}
                  </NavItem>
                )}
              </NavLink>
            ))}
          </SidebarNav>
          <SidebarFooter>
            <ThemeControls className="w-full px-1" menuSide="top" menuAlign="bar" />
            <NavLink to="/app">
              {({ isActive }) => (
                <NavItem variant="sidebar" active={isActive} icon={<ArrowLeftIcon />}>
                  {t("admin.backToApp")}
                </NavItem>
              )}
            </NavLink>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </SidebarShell>
  );
}
