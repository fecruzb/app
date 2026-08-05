import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, StickyNoteIcon, UsersIcon } from "lucide-react";
import type { MemberDto, NoteDto } from "@app/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/api";
import { useAuth } from "@/providers/auth";
import { useTenant } from "@/providers/tenant";

export function DashboardPage() {
  const { me } = useAuth();
  const { tenant } = useTenant();

  const { data: members } = useQuery({
    queryKey: ["members", tenant.id],
    queryFn: () => api.get<MemberDto[]>(`/tenants/${tenant.id}/members`),
  });
  const { data: notes } = useQuery({
    queryKey: ["notes", tenant.id],
    queryFn: () => api.get<NoteDto[]>(`/tenants/${tenant.id}/notes`),
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Hi, {me?.user.name.split(" ")[0]}</h1>
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          You're in <strong className="text-foreground">{tenant.name}</strong>
          <Badge variant="secondary">{tenant.role}</Badge>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <UsersIcon className="mb-2 size-5 text-muted-foreground" />
            <CardTitle>{members ? members.length : "—"} member(s)</CardTitle>
            <CardDescription>People with access to this tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={`/app/${tenant.slug}/settings`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Manage members <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <StickyNoteIcon className="mb-2 size-5 text-muted-foreground" />
            <CardTitle>{notes ? notes.length : "—"} note(s)</CardTitle>
            <CardDescription>Example resource — replace with your domain</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={`/app/${tenant.slug}/notes`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              View notes <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
