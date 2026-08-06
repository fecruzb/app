import { Fragment } from "react";
import { Route } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { RequireAuth } from "@/layouts/RequireAuth";
import { accountRoutes } from "@/domains/account/routes";
import { taskRoutes } from "@/domains/task/routes";
import { AcceptInvitePage } from "./pages/AcceptInvitePage";
import { AppIndexRedirect } from "./pages/AppIndexRedirect";
import { DashboardPage } from "./pages/DashboardPage";
import { TenantSettingsPage } from "./pages/TenantSettingsPage";

// The tenant owns the app shell; each domain contributes its own routes,
// composed here inside the :tenantSlug layout.
export const tenantRoutes = (
  <Fragment>
    <Route path="/invite/:token" element={<AcceptInvitePage />} />
    <Route path="/app" element={<RequireAuth />}>
      <Route index element={<AppIndexRedirect />} />
      <Route path=":tenantSlug" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="settings" element={<TenantSettingsPage />} />
        {taskRoutes}
        {accountRoutes}
      </Route>
    </Route>
  </Fragment>
);
