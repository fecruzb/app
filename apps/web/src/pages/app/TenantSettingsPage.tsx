import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { InviteDto, MemberDto, TenantRole } from "@app/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, ApiError } from "@/api";
import { useAuth } from "@/providers/auth";
import { useTenant } from "@/providers/tenant";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const roleSelectClass =
  "h-8 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

function GeneralSection() {
  const { me, refresh } = useAuth();
  const { tenant, isManager } = useTenant();
  const navigate = useNavigate();
  const [name, setName] = useState(tenant.name);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/tenants/${tenant.id}`, { name });
      await refresh();
      toast.success("Tenant renamed");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleLeave() {
    if (!me || !window.confirm(`Leave "${tenant.name}"?`)) return;
    try {
      await api.delete(`/tenants/${tenant.id}/members/${me.user.id}`);
      await refresh();
      navigate("/app");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to leave tenant");
    }
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
            <Button type="submit" disabled={saving || name === tenant.name}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Only administrators can rename the tenant.
          </p>
        )}
        {/* Owners can't leave their own tenant — the option only exists for guests */}
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

  const { data: members } = useQuery({
    queryKey: ["members", tenant.id],
    queryFn: () => api.get<MemberDto[]>(`/tenants/${tenant.id}/members`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["members", tenant.id] });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TenantRole }) =>
      api.patch(`/tenants/${tenant.id}/members/${userId}`, { role }),
    onSuccess: () => {
      void invalidate();
      toast.success("Role updated");
    },
    onError: (err) => {
      void invalidate();
      toast.error(err instanceof ApiError ? err.message : "Failed to update role");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/tenants/${tenant.id}/members/${userId}`),
    onSuccess: () => {
      void invalidate();
      toast.success("Member removed");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to remove"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Who has access to this tenant</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
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
                  <select
                    className={roleSelectClass}
                    value={member.role}
                    onChange={(e) =>
                      roleMutation.mutate({
                        userId: member.userId,
                        role: e.target.value as TenantRole,
                      })
                    }
                  >
                    <option value="owner">owner</option>
                    <option value="admin">admin</option>
                    <option value="member">member</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (window.confirm(`Remove ${member.name} from the tenant?`)) {
                        removeMutation.mutate(member.userId);
                      }
                    }}
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
  const [role, setRole] = useState<"admin" | "member">("member");

  const { data: invites } = useQuery({
    queryKey: ["invites", tenant.id],
    queryFn: () => api.get<InviteDto[]>(`/tenants/${tenant.id}/invites`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["invites", tenant.id] });

  const createMutation = useMutation({
    mutationFn: () => api.post<InviteDto>(`/tenants/${tenant.id}/invites`, { email, role }),
    onSuccess: () => {
      void invalidate();
      setEmail("");
      toast.success("Invite sent by email");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to invite"),
  });

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) => api.delete(`/tenants/${tenant.id}/invites/${inviteId}`),
    onSuccess: () => {
      void invalidate();
      toast.success("Invite revoked");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to revoke"),
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
          <select
            className={roleSelectClass}
            value={role}
            onChange={(e) => setRole(e.target.value as "admin" | "member")}
          >
            <option value="member">member</option>
            <option value="admin">admin</option>
          </select>
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
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage the tenant, members and invites</p>
      </div>
      <GeneralSection />
      <MembersSection />
      {isManager && <InvitesSection />}
    </div>
  );
}
