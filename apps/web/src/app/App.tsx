import { Route, Routes } from "react-router-dom";
import { adminRoutes, joinRoutes } from "@/domains/admin/routes";
import { authRoutes } from "@/domains/auth/routes";
import { marketingRoutes } from "@/domains/marketing/routes";
import { tenantRoutes } from "@/domains/tenant/routes";
import { NotFoundPage } from "@/app/NotFoundPage";

export function App() {
  return (
    <Routes>
      {marketingRoutes}
      {authRoutes}
      {joinRoutes}
      {adminRoutes}
      {tenantRoutes}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
