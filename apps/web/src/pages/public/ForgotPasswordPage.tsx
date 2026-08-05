import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api, ApiError } from "@/lib/api";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao enviar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar senha"
      description="Enviaremos um link de redefinição para o seu e-mail"
      footer={
        <Link to="/login" className="font-medium text-foreground hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          Se existir uma conta com <strong>{email}</strong>, você receberá um e-mail com o link de
          redefinição em instantes. O link expira em 1 hora.
        </p>
      ) : (
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
          <Button type="submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
