import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { PageHeader } from "@app/ui/page-header";
import { showApiError } from "@/lib/api";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { accountApi } from "../api";

function ProfileSection() {
  const { t } = useTranslation();
  const { me, refresh } = useAuth();
  const [name, setName] = useState(me?.user.name ?? "");

  const mutation = useMutation({
    mutationFn: () => accountApi.updateProfile({ name }),
    onSuccess: async () => {
      await refresh();
      toast.success(t("account.profileUpdated"));
    },
    onError: (err) => showApiError(err, t("account.saveFailed")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.profile")}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {me?.user.email}
          {me?.user.emailVerified ? (
            <Badge variant="secondary">{t("account.verified")}</Badge>
          ) : (
            <Badge variant="outline">{t("account.unverified")}</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex items-end gap-2"
        >
          <div className="grid flex-1 gap-2">
            <Label htmlFor="account-name">{t("common.name")}</Label>
            <Input
              id="account-name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending || name === me?.user.name}>
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => accountApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t("account.passwordChanged"));
    },
    onError: (err) => showApiError(err, t("account.changePasswordFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.password")}</CardTitle>
        <CardDescription>{t("account.passwordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">{t("account.currentPassword")}</Label>
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
            <Label htmlFor="new-password">{t("account.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("common.minPassword")}</p>
          </div>
          <div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("common.saving") : t("account.changePassword")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function AccountPage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("account.title")} description={t("account.description")} />
      <ProfileSection />
      <PasswordSection />
    </div>
  );
}
