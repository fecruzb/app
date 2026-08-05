import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { getLastTenantSlug } from "@/providers/tenant";

/** /app → redireciona para o último tenant usado (ou o primeiro). */
export function AppIndexRedirect() {
  const { me, logout } = useAuth();
  const navigate = useNavigate();

  const tenants = me?.tenants ?? [];

  if (tenants.length > 0) {
    const last = getLastTenantSlug();
    const target = tenants.find((t) => t.slug === last) ?? tenants[0];
    return <Navigate to={`/app/${target.slug}`} replace />;
  }

  // Caso raro: usuário saiu de todos os tenants (não há criação manual).
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Nenhum ambiente disponível</CardTitle>
          <CardDescription>
            Você não participa de nenhum tenant. Peça um convite a um administrador para voltar a
            acessar o app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => {
              void logout().then(() => navigate("/"));
            }}
          >
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
