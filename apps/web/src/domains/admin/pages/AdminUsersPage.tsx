import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AdminUserDto } from "@app/shared";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { useConfirm } from "@app/ui/confirm-dialog";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { adminApi } from "../api";

export function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const { me, refresh } = useAuth();
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.listUsers,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const toggleMutation = useMutation({
    mutationFn: ({ user, next }: { user: AdminUserDto; next: boolean }) =>
      adminApi.updateUser(user.id, { isPlatformAdmin: next }),
    onSuccess: async () => {
      await invalidate();
      await refresh();
      toast.success(t("admin.users.updated"));
    },
    onError: (err) => showApiError(err, t("admin.users.updateFailed")),
  });

  async function handleToggle(user: AdminUserDto) {
    const next = !user.isPlatformAdmin;
    const ok = await confirm({
      title: next ? t("admin.users.grantAdminTitle") : t("admin.users.revokeAdminTitle"),
      description: next
        ? t("admin.users.grantAdminDescription", { name: user.name })
        : t("admin.users.revokeAdminDescription", { name: user.name }),
      confirmLabel: next ? t("admin.users.grantAdmin") : t("admin.users.revokeAdmin"),
      cancelLabel: t("common.cancel"),
      destructive: !next,
    });
    if (ok) toggleMutation.mutate({ user, next });
  }

  return (
    <div className="grid gap-6">
      <PageHeader title={t("admin.users.title")} description={t("admin.users.description")} />

      {isLoading ? (
        <PageLoading />
      ) : !users?.length ? (
        <EmptyState>{t("admin.users.empty")}</EmptyState>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {users.map((user) => {
              const isSelf = user.id === me?.user.id;
              return (
                <div key={user.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.name}
                      {isSelf && <span className="text-muted-foreground"> {t("common.you")}</span>}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email} · {t("admin.users.tenants", { count: user.tenantCount })} ·{" "}
                      {new Date(user.createdAt).toLocaleDateString(dateLocale(i18n.language))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.emailVerified ? (
                      <Badge variant="secondary">{t("admin.users.verified")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("admin.users.unverified")}</Badge>
                    )}
                    {user.isPlatformAdmin && (
                      <Badge variant="default">{t("admin.users.platformAdmin")}</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={toggleMutation.isPending || (isSelf && user.isPlatformAdmin)}
                      onClick={() => void handleToggle(user)}
                    >
                      {user.isPlatformAdmin
                        ? t("admin.users.revokeAdmin")
                        : t("admin.users.grantAdmin")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
