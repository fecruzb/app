import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { MeDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api, ApiError } from "@/lib/api";
import { useAppConfig } from "@/lib/config";
import { useAuth } from "@/providers/auth";

export function RegisterPage() {
  const { setMe } = useAuth();
  const { selfSignupEnabled } = useAppConfig();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await api.post<MeDto>("/auth/register", { name, email, password });
      setMe(me);
      toast.success("Conta criada! Enviamos um e-mail de confirmação.");
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao criar conta");
    } finally {
      setSubmitting(false);
    }
  }

  if (!selfSignupEnabled) {
    return (
      <AuthLayout
        title="Cadastro por convite"
        description="O cadastro público está desativado. Peça um convite a um administrador."
        footer={
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Voltar para o login
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Se você recebeu um convite por e-mail, abra o link para criar sua conta.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      description="Comece grátis em segundos"
      footer={
        <span>
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Entrar
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
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
          {submitting ? "Criando..." : "Criar conta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
