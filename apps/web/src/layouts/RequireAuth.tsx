import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2Icon } from "lucide-react";
import { useAuth } from "@/domains/auth/context/auth-provider";

export function RequireAuth() {
  const { me, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!me) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
