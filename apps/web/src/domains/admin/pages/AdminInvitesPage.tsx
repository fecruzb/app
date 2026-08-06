import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { adminApi } from "../api";

export function AdminInvitesPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: invites, isLoading } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: adminApi.listInvites,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-invites"] });

  const createMutation = useMutation({
    mutationFn: () => adminApi.createInvite({ email }),
    onSuccess: () => {
      void invalidate();
      setEmail("");
      toast.success(t("admin.invites.sent"));
    },
    onError: (err) => showApiError(err, t("admin.invites.sendFailed")),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => adminApi.revokeInvite(inviteId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("admin.invites.revoked"));
    },
    onError: (err) => showApiError(err, t("admin.invites.revokeFailed")),
  });

  return (
    <div className="grid gap-6">
      <PageHeader title={t("admin.invites.title")} description={t("admin.invites.description")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.invites.sendTitle")}</CardTitle>
          <CardDescription>{t("admin.invites.sendDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <div className="grid min-w-48 flex-1 gap-2">
              <Label htmlFor="platform-invite-email">{t("common.email")}</Label>
              <Input
                id="platform-invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? t("common.sending") : t("admin.invites.send")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <PageLoading />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.invites.pendingTitle")}</CardTitle>
            <CardDescription>{t("admin.invites.pendingDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {!invites?.length ? (
              <p className="text-sm text-muted-foreground">{t("admin.invites.empty")}</p>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{invite.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invite.invitedByName
                        ? t("admin.invites.invitedBy", { name: invite.invitedByName })
                        : t("admin.invites.invitedByUnknown")}{" "}
                      ·{" "}
                      {t("admin.invites.expires", {
                        date: new Date(invite.expiresAt).toLocaleDateString(
                          dateLocale(i18n.language),
                        ),
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeMutation.mutate(invite.id)}
                    disabled={revokeMutation.isPending}
                  >
                    <Trash2Icon />
                    <span className="sr-only">{t("common.revoke")}</span>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
