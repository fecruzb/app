import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import type { PublicInviteDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api, ApiError } from "@/api";
import { useAuth } from "@/providers/auth";

export function AcceptInvitePage() {
  const { token } = useParams();
  const { me, isLoading: authLoading, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    data: invite,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => api.get<PublicInviteDto>(`/invites/${token}`),
    retry: false,
  });

  async function accept(body?: { name: string; password: string }) {
    setSubmitting(true);
    try {
      const result = await api.post<{ tenantSlug: string }>(`/invites/${token}/accept`, body);
      await refresh();
      toast.success(`Bem-vindo(a) a ${invite?.tenantName}!`);
      navigate(`/app/${result.tenantSlug}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao aceitar o convite");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNewAccount(e: FormEvent) {
    e.preventDefault();
    void accept({ name, password });
  }

  if (isLoading || authLoading) {
    return (
      <AuthLayout title="Convite">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Carregando convite...
        </div>
      </AuthLayout>
    );
  }

  if (error || !invite) {
    return (
      <AuthLayout title="Convite inválido" description="Este convite não existe ou já expirou.">
        <Button variant="outline" asChild>
          <Link to="/">Ir para o início</Link>
        </Button>
      </AuthLayout>
    );
  }

  // Logado: basta confirmar (a API valida se o e-mail bate)
  if (me) {
    return (
      <AuthLayout
        title={`Convite para ${invite.tenantName}`}
        description={`Você foi convidado(a) como ${invite.role === "admin" ? "administrador(a)" : "membro"}.`}
      >
        {me.user.email === invite.email ? (
          <Button className="w-full" disabled={submitting} onClick={() => void accept()}>
            {submitting ? "Entrando..." : `Entrar em ${invite.tenantName}`}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este convite é para <strong>{invite.email}</strong>, mas você está logado(a) como{" "}
            <strong>{me.user.email}</strong>. Saia da conta atual para aceitar.
          </p>
        )}
      </AuthLayout>
    );
  }

  // Deslogado com conta existente: precisa logar antes
  if (invite.userExists) {
    return (
      <AuthLayout
        title={`Convite para ${invite.tenantName}`}
        description={`Entre com a conta ${invite.email} para aceitar o convite.`}
      >
        <Button className="w-full" asChild>
          <Link to="/login" state={{ from: `/invite/${token}` }}>
            Fazer login
          </Link>
        </Button>
      </AuthLayout>
    );
  }

  // Deslogado sem conta: cria a conta na hora
  return (
    <AuthLayout
      title={`Convite para ${invite.tenantName}`}
      description={`Crie sua conta com o e-mail ${invite.email} para entrar.`}
    >
      <form onSubmit={handleNewAccount} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Criando..." : "Criar conta e entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
