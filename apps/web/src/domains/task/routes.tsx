import { Route } from "react-router-dom";
import { TasksPage } from "./pages/TasksPage";

/** Routes rendered inside the tenant app shell (see tenant/routes.tsx). */
export const taskRoutes = <Route path="tasks" element={<TasksPage />} />;
