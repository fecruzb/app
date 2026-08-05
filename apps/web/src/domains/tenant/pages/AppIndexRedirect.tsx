import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/domains/auth/auth-provider";
import { getLastTenantSlug } from "../tenant-provider";

/** /app → redirects to the last used tenant (or the first). */
export function AppIndexRedirect() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();

  const tenants = me?.tenants ?? [];

  if (tenants.length > 0) {
    const last = getLastTenantSlug();
    const target = tenants.find((t) => t.slug === last) ?? tenants[0];
    return <Navigate to={`/app/${target.slug}`} replace />;
  }

  // Edge case: user left all tenants (there is no manual creation).
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>No environment available</CardTitle>
          <CardDescription>
            You don't belong to any tenant. Ask an administrator for an invite to access the app
            again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              void logout().then(() => navigate("/"));
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
