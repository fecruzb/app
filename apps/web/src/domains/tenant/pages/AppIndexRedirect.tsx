import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Button } from "@app/ui/button";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { getLastTenantSlug } from "../context/tenant-provider";

/** /app → redirects to the last used tenant (or the first). */
export function AppIndexRedirect() {
  const { t } = useTranslation();
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
          <CardTitle>{t("appIndex.noTenantTitle")}</CardTitle>
          <CardDescription>{t("appIndex.noTenantDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              void logout().then(() => navigate("/"));
            }}
          >
            {t("nav.signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
