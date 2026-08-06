import { Fragment } from "react";
import { Route } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AccountPage } from "@/domains/account/pages/AccountPage";
import { TasksPage } from "@/domains/task/pages/TasksPage";
import { AcceptInvitePage } from "./pages/AcceptInvitePage";
import { AppIndexRedirect } from "./pages/AppIndexRedirect";
import { DashboardPage } from "./pages/DashboardPage";
import { TenantSettingsPage } from "./pages/TenantSettingsPage";

export const tenantRoutes = (
  <Fragment>
    <Route path="/invite/:token" element={<AcceptInvitePage />} />
    <Route path="/app" element={<RequireAuth />}>
      <Route index element={<AppIndexRedirect />} />
      <Route path=":tenantSlug" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="settings" element={<TenantSettingsPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
    </Route>
  </Fragment>
);
