import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { TenantRole } from "@app/shared";
import { Avatar, AvatarFallback } from "@app/ui/avatar";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { useConfirm } from "@app/ui/confirm-dialog";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { initials } from "@/lib/utils";
import { dateLocale } from "@/i18n";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { tenantApi } from "../api";
import { RoleSelect } from "../components/role-select";
import { useTenant } from "../context/tenant-provider";

function GeneralSection() {
  const { t } = useTranslation();
  const { me, refresh } = useAuth();
  const { tenant, isManager } = useTenant();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [name, setName] = useState(tenant.name);

  const renameMutation = useMutation({
    mutationFn: () => tenantApi.rename(tenant.id, name),
    onSuccess: async () => {
      await refresh();
      toast.success(t("settings.renamed"));
    },
    onError: (err) => showApiError(err, t("settings.saveFailed")),
  });

  const leaveMutation = useMutation({
    mutationFn: () => tenantApi.removeMember(tenant.id, me!.user.id),
    onSuccess: async () => {
      await refresh();
      navigate("/app");
    },
    onError: (err) => showApiError(err, t("settings.leaveFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    renameMutation.mutate();
  }

  async function handleLeave() {
    const ok = await confirm({
      title: t("settings.leaveTitle"),
      description: t("settings.leaveDescription", { name: tenant.name }),
      confirmLabel: t("common.leave"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) leaveMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.general")}</CardTitle>
        <CardDescription>{t("settings.generalDescription", { slug: tenant.slug })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isManager ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="tenant-name">{t("common.name")}</Label>
              <Input
                id="tenant-name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={renameMutation.isPending || name === tenant.name}>
              {renameMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">{t("settings.onlyAdminsRename")}</p>
        )}
        {/* Owners can't leave their own tenant — the option only exists for guests. */}
        {tenant.role !== "owner" && (
          <div className="border-t pt-4">
            <Button variant="outline" onClick={() => void handleLeave()}>
              {t("settings.leaveTenant")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MembersSection() {
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
      tenantApi.setMemberRole(tenant.id, userId, role),
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

function InvitesSection() {
  const { t, i18n } = useTranslation();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TenantRole>("member");

  const { data: invites } = useQuery({
    queryKey: ["invites", tenant.id],
    queryFn: () => tenantApi.invites(tenant.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["invites", tenant.id] });

  const createMutation = useMutation({
    mutationFn: () =>
      tenantApi.createInvite(tenant.id, { email, role: role as "admin" | "member" }),
    onSuccess: () => {
      void invalidate();
      setEmail("");
      toast.success(t("settings.inviteSent"));
    },
    onError: (err) => showApiError(err, t("settings.inviteFailed")),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => tenantApi.revokeInvite(tenant.id, inviteId),
    onSuccess: () => {
      void invalidate();
      toast.success(t("settings.inviteRevoked"));
    },
    onError: (err) => showApiError(err, t("settings.revokeInviteFailed")),
  });

  async function handleRevoke(inviteId: string, inviteEmail: string) {
    const ok = await confirm({
      title: t("settings.revokeInviteTitle"),
      description: t("settings.revokeInviteDescription", { email: inviteEmail }),
      confirmLabel: t("common.revoke"),
      cancelLabel: t("common.cancel"),
      destructive: true,
    });
    if (ok) revokeMutation.mutate(inviteId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.invites")}</CardTitle>
        <CardDescription>{t("settings.invitesDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <div className="grid min-w-48 flex-1 gap-2">
            <Label htmlFor="invite-email">{t("common.email")}</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <RoleSelect value={role} onChange={setRole} />
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t("common.sending") : t("settings.invite")}
          </Button>
        </form>

        {invites && invites.length > 0 && (
          <div className="grid gap-2 border-t pt-4">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{invite.email}</span>
                <Badge variant="outline">{t(`roles.${invite.role}`)}</Badge>
                <span className="text-xs text-muted-foreground">
                  {t("settings.expires", {
                    date: new Date(invite.expiresAt).toLocaleDateString(dateLocale(i18n.language)),
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleRevoke(invite.id, invite.email)}
                >
                  <Trash2Icon />
                  <span className="sr-only">{t("common.revoke")}</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TenantSettingsPage() {
  const { t } = useTranslation();
  const { isManager } = useTenant();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("settings.title")} description={t("settings.description")} />
      <GeneralSection />
      <MembersSection />
      {isManager && <InvitesSection />}
    </div>
  );
}
