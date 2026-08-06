import { Route } from "react-router-dom";
import { AccountPage } from "./pages/AccountPage";

/** Routes rendered inside the tenant app shell (see tenant/routes.tsx). */
export const accountRoutes = <Route path="account" element={<AccountPage />} />;
