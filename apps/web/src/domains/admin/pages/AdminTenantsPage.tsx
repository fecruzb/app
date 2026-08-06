import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AdminTenantDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { adminApi } from "../api";

function TenantRow({ tenant }: { tenant: AdminTenantDto }) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(tenant.name);

  const renameMutation = useMutation({
    mutationFn: () => adminApi.updateTenant(tenant.id, { name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      setEditing(false);
      toast.success(t("admin.tenants.renamed"));
    },
    onError: (err) => showApiError(err, t("admin.tenants.renameFailed")),
  });

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim() && name !== tenant.name) renameMutation.mutate();
              else setEditing(false);
            }}
          >
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="max-w-xs"
            />
            <Button type="submit" size="sm" disabled={renameMutation.isPending}>
              {renameMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setName(tenant.name);
                setEditing(false);
              }}
            >
              {t("admin.tenants.cancel")}
            </Button>
          </form>
        ) : (
          <>
            <p className="truncate text-sm font-medium">{tenant.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {tenant.slug} · {t("admin.tenants.members", { count: tenant.memberCount })} ·{" "}
              {new Date(tenant.createdAt).toLocaleDateString(dateLocale(i18n.language))}
            </p>
          </>
        )}
      </div>
      {!editing && (
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          {t("admin.tenants.rename")}
        </Button>
      )}
    </div>
  );
}

export function AdminTenantsPage() {
  const { t } = useTranslation();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ["admin-tenants"],
    queryFn: adminApi.listTenants,
  });

  return (
    <div className="grid gap-6">
      <PageHeader title={t("admin.tenants.title")} description={t("admin.tenants.description")} />

      {isLoading ? (
        <PageLoading />
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {tenants?.map((tenant) => (
              <TenantRow key={tenant.id} tenant={tenant} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
