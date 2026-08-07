import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { TenantRole } from "@app/shared";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { EmptyState } from "@app/ui/empty-state";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { useConfirm } from "@app/ui/confirm-dialog";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { tenantApi } from "../api";
import { RoleSelect } from "./role-select";
import { useTenant } from "../context/tenant-provider";

export function InvitesSection() {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantRole>("member");

  const { data: invites } = useQuery({
    queryKey: ["invites", tenant.id],
    queryFn: () => tenantApi.invites(tenant.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["invites", tenant.id] });

  const createMutation = useMutation({
    mutationFn: () =>
      tenantApi.createInvite(tenant.id, { email, role: role as "admin" | "member" }),
    onSuccess: () => {
      void invalidate();
      setEmail("");
      toast.success(t("settings.inviteSent"));
    },
    onError: (err) => showApiError(err, t("settings.inviteFailed")),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => tenantApi.revokeInvite(tenant.id, inviteId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("settings.inviteRevoked"));
    },
    onError: (err) => showApiError(err, t("settings.revokeInviteFailed")),
  });

  async function handleRevoke(inviteId: string, inviteEmail: string) {
    const ok = await confirm({
      title: t("settings.revokeInviteTitle"),
      description: t("settings.revokeInviteDescription", { email: inviteEmail }),
      confirmLabel: t("common.revoke"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) revokeMutation.mutate(inviteId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.invites")}</CardTitle>
        <CardDescription>{t("settings.invitesDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <div className="grid min-w-48 flex-1 gap-2">
            <Label htmlFor="invite-email">{t("common.email")}</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <RoleSelect value={role} onChange={setRole} />
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t("common.sending") : t("settings.invite")}
          </Button>
        </form>

        {invites && invites.length > 0 ? (
          <div className="grid gap-2 border-t pt-4">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{invite.email}</span>
                <Badge variant="outline">{t(`roles.${invite.role}`)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {t("settings.expires", {
                    date: new Date(invite.expiresAt).toLocaleDateString(dateLocale(i18n.language)),
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleRevoke(invite.id, invite.email)}
                >
                  <Trash2Icon />
                  <span className="sr-only">{t("common.revoke")}</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          invites && <EmptyState>{t("settings.noInvites")}</EmptyState>
        )}
      </CardContent>
    </Card>
  );
}
