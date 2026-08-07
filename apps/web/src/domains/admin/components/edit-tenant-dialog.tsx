import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { planIds, type AdminTenantDto, type PlanId } from "@app/shared";
import { Button } from "@app/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@app/ui/dialog";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { showApiError } from "@/lib/api";
import { adminApi } from "../api";

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

export function EditTenantDialog({
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
