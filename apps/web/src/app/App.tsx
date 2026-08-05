import { Route, Routes } from "react-router-dom";
import { authRoutes } from "@/domains/auth/routes";
import { marketingRoutes } from "@/domains/marketing/routes";
import { tenantRoutes } from "@/domains/tenant/routes";
import { NotFoundPage } from "@/app/NotFoundPage";

export function App() {
  return (
    <Routes>
      {marketingRoutes}
      {authRoutes}
      {tenantRoutes}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
