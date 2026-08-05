import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { MeDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api, ApiError } from "@/lib/api";
import { useAppConfig } from "@/lib/config";
import { useAuth } from "@/providers/auth";

export function LoginPage() {
  const { setMe } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await api.post<MeDto>("/auth/login", { email, password });
      setMe(me);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? "/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Entrar"
      description="Acesse sua conta com e-mail e senha"
      footer={
        selfSignupEnabled && (
          <span>
            Não tem conta?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline">
              Criar conta
            </Link>
          </span>
        )
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
