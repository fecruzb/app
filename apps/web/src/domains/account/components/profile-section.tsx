import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { showApiError } from "@/lib/api";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { accountApi } from "../api";

export function ProfileSection() {
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
