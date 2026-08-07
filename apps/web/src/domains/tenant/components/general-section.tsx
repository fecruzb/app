import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { useConfirm } from "@app/ui/confirm-dialog";
import { showApiError } from "@/lib/api";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { tenantApi } from "../api";
import { useTenant } from "../context/tenant-provider";

export function GeneralSection() {
  const { t } = useTranslation();
  const { me, refresh } = useAuth();
  const { tenant, isManager } = useTenant();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [name, setName] = useState(tenant.name);

  const renameMutation = useMutation({
    mutationFn: () => tenantApi.rename(tenant.id, { name }),
    onSuccess: async () => {
      await refresh();
      toast.success(t("settings.renamed"));
    },
    onError: (err) => showApiError(err, t("settings.saveFailed")),
  });

  const leaveMutation = useMutation({
    mutationFn: () => tenantApi.removeMember(tenant.id, me!.user.id),
    onSuccess: async () => {
      await refresh();
      navigate("/app");
    },
    onError: (err) => showApiError(err, t("settings.leaveFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    renameMutation.mutate();
  }

  async function handleLeave() {
    const ok = await confirm({
      title: t("settings.leaveTitle"),
      description: t("settings.leaveDescription", { name: tenant.name }),
      confirmLabel: t("common.leave"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) leaveMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.general")}</CardTitle>
        <CardDescription>{t("settings.generalDescription", { slug: tenant.slug })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isManager ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="tenant-name">{t("common.name")}</Label>
              <Input
                id="tenant-name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={renameMutation.isPending || name === tenant.name}>
              {renameMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">{t("settings.onlyAdminsRename")}</p>
        )}
        {/* Owners can't leave their own tenant — the option only exists for guests. */}
        {tenant.role !== "owner" && (
          <div className="border-t pt-4">
            <Button variant="outline" onClick={() => void handleLeave()}>
              {t("settings.leaveTenant")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
