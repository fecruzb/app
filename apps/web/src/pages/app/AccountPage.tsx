import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { UserDto } from "@app/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth";

function ProfileSection() {
  const { me, refresh } = useAuth();
  const [name, setName] = useState(me?.user.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch<UserDto>("/account", { name });
      await refresh();
      toast.success("Perfil atualizado");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {me?.user.email}
          {me?.user.emailVerified ? (
            <Badge variant="secondary">verificado</Badge>
          ) : (
            <Badge variant="outline">não verificado</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="account-name">Nome</Label>
            <Input
              id="account-name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving || name === me?.user.name}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/account/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Senha alterada — as outras sessões foram encerradas");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erro ao alterar a senha");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senha</CardTitle>
        <CardDescription>Alterar a senha encerra as outras sessões ativas</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
          </div>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Alterar senha"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AccountPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Minha conta</h1>
        <p className="text-muted-foreground">Perfil e segurança</p>
      </div>
      <ProfileSection />
      <PasswordSection />
    </div>
  );
}
