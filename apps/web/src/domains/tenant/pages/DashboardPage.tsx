import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon, CheckSquareIcon, UsersIcon } from "lucide-react";
import { Badge } from "@app/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { useAuth } from "@/domains/auth/auth-provider";
import { taskApi } from "@/domains/task/api";
import { tenantApi } from "../api";
import { useTenant } from "../tenant-provider";

export function DashboardPage() {
  const { t } = useTranslation();
  const { me } = useAuth();
  const { tenant } = useTenant();

  const { data: members } = useQuery({
    queryKey: ["members", tenant.id],
    queryFn: () => tenantApi.members(tenant.id),
  });
  const { data: tasks } = useQuery({
    queryKey: ["tasks", tenant.id],
    queryFn: () => taskApi.list(tenant.id),
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {t("dashboard.hi", { name: me?.user.name.split(" ")[0] })}
        </h1>
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          {t("dashboard.youreIn")} <strong className="text-foreground">{tenant.name}</strong>
          <Badge variant="secondary">{t(`roles.${tenant.role}`)}</Badge>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <UsersIcon className="mb-2 size-5 text-muted-foreground" />
            <CardTitle>
              {members ? t("dashboard.members", { count: members.length }) : "—"}
            </CardTitle>
            <CardDescription>{t("dashboard.membersDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={`/app/${tenant.slug}/settings`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {t("dashboard.manageMembers")} <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CheckSquareIcon className="mb-2 size-5 text-muted-foreground" />
            <CardTitle>{tasks ? t("dashboard.tasks", { count: tasks.length }) : "—"}</CardTitle>
            <CardDescription>{t("dashboard.tasksDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={`/app/${tenant.slug}/tasks`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              {t("dashboard.viewTasks")} <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
