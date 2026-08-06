import { Route } from "react-router-dom";
import { ImagesPage } from "./pages/ImagesPage";

/** Routes rendered inside the tenant app shell (see tenant/routes.tsx). */
export const imageRoutes = <Route path="images" element={<ImagesPage />} />;
