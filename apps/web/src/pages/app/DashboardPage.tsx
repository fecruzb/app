import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightIcon, StickyNoteIcon, UsersIcon } from "lucide-react";
import type { MemberDto, NoteDto } from "@app/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
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
        <h1 className="text-2xl font-semibold">Olá, {me?.user.name.split(" ")[0]}</h1>
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          Você está em <strong className="text-foreground">{tenant.name}</strong>
          <Badge variant="secondary">{tenant.role}</Badge>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <UsersIcon className="mb-2 size-5 text-muted-foreground" />
            <CardTitle>{members ? members.length : "—"} membro(s)</CardTitle>
            <CardDescription>Pessoas com acesso a este tenant</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={`/app/${tenant.slug}/settings`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Gerenciar membros <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <StickyNoteIcon className="mb-2 size-5 text-muted-foreground" />
            <CardTitle>{notes ? notes.length : "—"} nota(s)</CardTitle>
            <CardDescription>Recurso de exemplo — troque pelo seu domínio</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to={`/app/${tenant.slug}/notes`}
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Ver notas <ArrowRightIcon className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
