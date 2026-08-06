import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { AdminTenantDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Card, CardContent } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
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
  const [slug, setSlug] = useState(tenant.slug);

  const updateMutation = useMutation({
    mutationFn: () => {
      const body: { name?: string; slug?: string } = {};
      if (name.trim() !== tenant.name) body.name = name.trim();
      if (slug.trim().toLowerCase() !== tenant.slug) body.slug = slug.trim().toLowerCase();
      return adminApi.updateTenant(tenant.id, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      setEditing(false);
      toast.success(t("admin.tenants.updated"));
    },
    onError: (err) => showApiError(err, t("admin.tenants.updateFailed")),
  });

  function reset() {
    setName(tenant.name);
    setSlug(tenant.slug);
    setEditing(false);
  }

  return (
    <div className="flex flex-wrap items-start gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        {editing ? (
          <form
            className="grid max-w-md gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const nameChanged = name.trim() !== tenant.name;
              const slugChanged = slug.trim().toLowerCase() !== tenant.slug;
              if (!nameChanged && !slugChanged) {
                setEditing(false);
                return;
              }
              updateMutation.mutate();
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor={`tenant-name-${tenant.id}`}>{t("admin.tenants.name")}</Label>
              <Input
                id={`tenant-name-${tenant.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`tenant-slug-${tenant.id}`}>{t("admin.tenants.slug")}</Label>
              <Input
                id={`tenant-slug-${tenant.id}`}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                minLength={2}
                maxLength={40}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                title={t("admin.tenants.slugHint")}
              />
              <p className="text-xs text-muted-foreground">{t("admin.tenants.slugHint")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                {t("admin.tenants.cancel")}
              </Button>
            </div>
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
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setName(tenant.name);
            setSlug(tenant.slug);
            setEditing(true);
          }}
        >
          {t("admin.tenants.edit")}
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
