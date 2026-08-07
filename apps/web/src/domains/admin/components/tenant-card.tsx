import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AdminTenantDto } from "@app/shared";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardHeader } from "@app/ui/card";
import { initials } from "@/lib/utils";
import { dateLocale } from "@/i18n";
import { EditTenantDialog } from "./edit-tenant-dialog";

export function TenantCard({ tenant }: { tenant: AdminTenantDto }) {
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
