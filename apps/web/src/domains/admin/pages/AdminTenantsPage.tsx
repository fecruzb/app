import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { planIds, type AdminTenantDto, type PlanId } from "@app/shared";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardHeader } from "@app/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@app/ui/dialog";
import { EmptyState } from "@app/ui/empty-state";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { initials } from "@/lib/utils";
import { dateLocale } from "@/i18n";
import { adminApi } from "../api";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

function EditTenantDialog({
  tenant,
  open,
  onOpenChange,
}: {
  tenant: AdminTenantDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [name, setName] = useState(tenant.name);
  const [slug, setSlug] = useState(tenant.slug);
  const [planId, setPlanId] = useState<PlanId>(tenant.planId);

  useEffect(() => {
    if (!open) return;
    setName(tenant.name);
    setSlug(tenant.slug);
    setPlanId(tenant.planId);
  }, [open, tenant]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const body: { name?: string; slug?: string; planId?: PlanId } = {};
      if (name.trim() !== tenant.name) body.name = name.trim();
      if (slug.trim().toLowerCase() !== tenant.slug) body.slug = slug.trim().toLowerCase();
      if (planId !== tenant.planId) body.planId = planId;
      return adminApi.updateTenant(tenant.id, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-tenants"] });
      onOpenChange(false);
      toast.success(t("admin.tenants.updated"));
    },
    onError: (err) => showApiError(err, t("admin.tenants.updateFailed")),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) updateMutation.reset();
      }}
    >
      <DialogContent closeLabel={t("common.close")}>
        <DialogHeader>
          <DialogTitle>{t("admin.tenants.editTitle")}</DialogTitle>
          <DialogDescription>{tenant.name}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const nameChanged = name.trim() !== tenant.name;
            const slugChanged = slug.trim().toLowerCase() !== tenant.slug;
            const planChanged = planId !== tenant.planId;
            if (!nameChanged && !slugChanged && !planChanged) {
              onOpenChange(false);
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
          <div className="grid gap-1.5">
            <Label htmlFor={`tenant-plan-${tenant.id}`}>{t("admin.tenants.plan")}</Label>
            <select
              id={`tenant-plan-${tenant.id}`}
              className={selectClass}
              value={planId}
              onChange={(e) => setPlanId(e.target.value as PlanId)}
            >
              {planIds.map((id) => (
                <option key={id} value={id}>
                  {t(`plans.${id}.name`)}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              {t("admin.tenants.cancel")}
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TenantCard({ tenant }: { tenant: AdminTenantDto }) {
  const { t, i18n } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold leading-none">{tenant.name}</h2>
            <Badge variant="secondary">{t(`plans.${tenant.planId}.name`)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono">{tenant.slug}</span>
            {" · "}
            {t("admin.tenants.members", { count: tenant.memberCount })}
            {" · "}
            {new Date(tenant.createdAt).toLocaleDateString(dateLocale(i18n.language))}
          </p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0" onClick={() => setEditOpen(true)}>
          {t("admin.tenants.edit")}
        </Button>
        <EditTenantDialog tenant={tenant} open={editOpen} onOpenChange={setEditOpen} />
      </CardHeader>
      <CardContent className="border-t pt-3">
        {tenant.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("admin.tenants.noMembers")}</p>
        ) : (
          <ul className="grid gap-3">
            {tenant.members.map((member) => (
              <li key={member.userId} className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {t(`roles.${member.role}`)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
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
      ) : !tenants?.length ? (
        <EmptyState>{t("admin.tenants.empty")}</EmptyState>
      ) : (
        <div className="grid gap-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
