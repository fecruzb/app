import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { MeDto } from "@app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth";

export function ResetPasswordPage() {
  const { token } = useParams();
  const { setMe } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await api.post<MeDto>("/auth/reset-password", { token, password });
      setMe(me);
      toast.success("Senha redefinida!");
      navigate("/app", { replace: true });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao redefinir a senha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Nova senha"
      description="Escolha uma nova senha para a sua conta"
      footer={
        <Link to="/forgot-password" className="font-medium text-foreground hover:underline">
          Pedir um novo link
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="password">Nova senha</Label>
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
          {submitting ? "Salvando..." : "Redefinir senha"}
        </Button>
      </form>
    </AuthLayout>
  );
}
