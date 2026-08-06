import { Navigate, Route } from "react-router-dom";
import { RequireAuth } from "@/layouts/RequireAuth";
import { AdminLayout } from "./admin-layout";
import { AdminPlansPage } from "./pages/AdminPlansPage";
import { AdminTenantsPage } from "./pages/AdminTenantsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { RequirePlatformAdmin } from "./require-platform-admin";

/** Platform admin area — outside the tenant slug layout. */
export const adminRoutes = (
  <Route path="/admin" element={<RequireAuth />}>
    <Route element={<RequirePlatformAdmin />}>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="tenants" element={<AdminTenantsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
      </Route>
    </Route>
  </Route>
);
