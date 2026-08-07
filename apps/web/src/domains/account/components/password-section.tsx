import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { showApiError } from "@/lib/api";
import { accountApi } from "../api";

export function PasswordSection() {
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
