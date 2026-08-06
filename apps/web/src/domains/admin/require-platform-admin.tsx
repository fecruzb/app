import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/domains/auth/auth-provider";

/** Client-side gate — API still enforces platform admin. */
export function RequirePlatformAdmin() {
  const { me } = useAuth();
  if (!me?.user.isPlatformAdmin) return <Navigate to="/app" replace />;
  return <Outlet />;
}
