import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { RoleSelect } from "@/components/role-select";
import { showApiError } from "@/lib/api";
import { initials } from "@/lib/utils";
import { useAuth } from "@/domains/auth/auth-provider";
import { tenantApi } from "../api";
import { useTenant } from "../tenant-provider";

function GeneralSection() {
  const { me, refresh } = useAuth();
  const { tenant, isManager } = useTenant();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [name, setName] = useState(tenant.name);

  const renameMutation = useMutation({
    mutationFn: () => tenantApi.rename(tenant.id, name),
    onSuccess: async () => {
      await refresh();
      toast.success("Tenant renamed");
    },
    onError: (err) => showApiError(err, "Failed to save"),
  });

  const leaveMutation = useMutation({
    mutationFn: () => tenantApi.removeMember(tenant.id, me!.user.id),
    onSuccess: async () => {
      await refresh();
      navigate("/app");
    },
    onError: (err) => showApiError(err, "Failed to leave tenant"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    renameMutation.mutate();
  }

  async function handleLeave() {
    const ok = await confirm({
      title: "Leave tenant",
      description: `Leave "${tenant.name}"?`,
      confirmLabel: "Leave",
      destructive: true,
    });
    if (ok) leaveMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Tenant name and identification (slug: {tenant.slug})</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {isManager ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="tenant-name">Name</Label>
              <Input
                id="tenant-name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={renameMutation.isPending || name === tenant.name}>
              {renameMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Only administrators can rename the tenant.
          </p>
        )}
        {/* Owners can't leave their own tenant — the option only exists for guests. */}
        {tenant.role !== "owner" && (
          <div className="border-t pt-4">
            <Button variant="outline" onClick={() => void handleLeave()}>
              Leave this tenant
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MembersSection() {
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
      toast.success("Role updated");
    },
    onError: (err) => {
      void invalidate();
      showApiError(err, "Failed to update role");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => tenantApi.removeMember(tenant.id, userId),
    onSuccess: () => {
      void invalidate();
      toast.success("Member removed");
    },
    onError: (err) => showApiError(err, "Failed to remove member"),
  });

  async function handleRemove(userId: string, name: string) {
    const ok = await confirm({
      title: "Remove member",
      description: `Remove ${name} from the tenant?`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) removeMutation.mutate(userId);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Who has access to this tenant</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading members...</p>}
        {members?.map((member) => {
          const isSelf = member.userId === me?.user.id;
          return (
            <div key={member.userId} className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials(member.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {member.name}
                  {isSelf && <span className="text-muted-foreground"> (you)</span>}
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
                    <span className="sr-only">Remove</span>
                  </Button>
                </>
              ) : (
                <Badge variant="secondary">{member.role}</Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function InvitesSection() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
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
      toast.success("Invite sent by email");
    },
    onError: (err) => showApiError(err, "Failed to invite"),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => tenantApi.revokeInvite(tenant.id, inviteId),
    onSuccess: () => {
      void invalidate();
      toast.success("Invite revoked");
    },
    onError: (err) => showApiError(err, "Failed to revoke invite"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invites</CardTitle>
        <CardDescription>Invite people to this tenant by email</CardDescription>
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
            <Label htmlFor="invite-email">Email</Label>
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
            {createMutation.isPending ? "Sending..." : "Invite"}
          </Button>
        </form>

        {invites && invites.length > 0 && (
          <div className="grid gap-2 border-t pt-4">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{invite.email}</span>
                <Badge variant="outline">{invite.role}</Badge>
                <span className="text-xs text-muted-foreground">
                  expires {new Date(invite.expiresAt).toLocaleDateString("en-US")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => revokeMutation.mutate(invite.id)}
                >
                  <Trash2Icon />
                  <span className="sr-only">Revoke</span>
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
  const { isManager } = useTenant();

  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Manage the tenant, members and invites" />
      <GeneralSection />
      <MembersSection />
      {isManager && <InvitesSection />}
    </div>
  );
}
