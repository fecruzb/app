import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { TenantRole } from "@app/shared";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { useConfirm } from "@app/ui/confirm-dialog";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { initials } from "@/lib/utils";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { tenantApi } from "../api";
import { RoleSelect } from "./role-select";
import { useTenant } from "../context/tenant-provider";

export function MembersSection() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { tenant, isManager } = useTenant();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", tenant.id],
    queryFn: () => tenantApi.members(tenant.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["members", tenant.id] });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TenantRole }) =>
      tenantApi.setMemberRole(tenant.id, userId, { role }),
    onSuccess: () => {
      void invalidate();
      toast.success(t("settings.roleUpdated"));
    },
    onError: (err) => {
      void invalidate();
      showApiError(err, t("settings.roleUpdateFailed"));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => tenantApi.removeMember(tenant.id, userId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("settings.memberRemoved"));
    },
    onError: (err) => showApiError(err, t("settings.removeFailed")),
  });

  async function handleRemove(userId: string, name: string) {
    const ok = await confirm({
      title: t("settings.removeTitle"),
      description: t("settings.removeDescription", { name }),
      confirmLabel: t("common.remove"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) removeMutation.mutate(userId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.members")}</CardTitle>
        <CardDescription>{t("settings.membersDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isLoading ? (
          <PageLoading />
        ) : (
          members?.map((member) => {
            const isSelf = member.userId === me?.user.id;
            return (
              <div key={member.userId} className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.name}
                    {isSelf && <span className="text-muted-foreground"> {t("common.you")}</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                {isManager && !isSelf ? (
                  <>
                    <RoleSelect
                      className="h-8"
                      includeOwner={member.role === "owner"}
                      value={member.role}
                      onChange={(role) => roleMutation.mutate({ userId: member.userId, role })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void handleRemove(member.userId, member.name)}
                    >
                      <Trash2Icon />
                      <span className="sr-only">{t("common.remove")}</span>
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary">{t(`roles.${member.role}`)}</Badge>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
