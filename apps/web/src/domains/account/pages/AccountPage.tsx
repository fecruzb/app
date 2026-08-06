import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { CreatedApiKeyDto } from "@app/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/domains/auth/auth-provider";
import { accountApi } from "../api";

function ProfileSection() {
  const { me, refresh } = useAuth();
  const [name, setName] = useState(me?.user.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await accountApi.updateProfile({ name });
      await refresh();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {me?.user.email}
          {me?.user.emailVerified ? (
            <Badge variant="secondary">verified</Badge>
          ) : (
            <Badge variant="outline">unverified</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="account-name">Name</Label>
            <Input
              id="account-name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving || name === me?.user.name}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await accountApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password changed — other sessions were ended");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Changing your password ends other active sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Minimum of 8 characters</p>
          </div>
          <div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Change password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

const roleSelectClass =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy — copy it manually");
  }
}

/** Shown once, right after creating a key: the raw value and a ready mcp.json. */
function CreatedKeyPanel({ created }: { created: CreatedApiKeyDto }) {
  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        "app-base": {
          url: `${window.location.origin}/api/mcp`,
          headers: { Authorization: `Bearer ${created.key}` },
        },
      },
    },
    null,
    2,
  );

  return (
    <div className="grid gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div>
        <p className="text-sm font-medium">Copy your key now — it won't be shown again</p>
        <p className="text-xs text-muted-foreground">
          Scoped to <strong>{created.tenantName}</strong>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 font-mono text-xs">
          {created.key}
        </code>
        <Button variant="outline" size="icon" onClick={() => void copyToClipboard(created.key)}>
          <CopyIcon />
          <span className="sr-only">Copy key</span>
        </Button>
      </div>
      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Add to .cursor/mcp.json</Label>
          <Button variant="ghost" size="sm" onClick={() => void copyToClipboard(mcpConfig)}>
            <CopyIcon /> Copy config
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs">
          {mcpConfig}
        </pre>
      </div>
    </div>
  );
}

function ApiKeysSection() {
  const { me } = useAuth();
  const queryClient = useQueryClient();
  const tenants = me?.tenants ?? [];
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [created, setCreated] = useState<CreatedApiKeyDto | null>(null);

  const { data: keys } = useQuery({
    queryKey: ["api-keys"],
    queryFn: accountApi.listApiKeys,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["api-keys"] });

  const createMutation = useMutation({
    mutationFn: () => accountApi.createApiKey({ name, tenantId }),
    onSuccess: (key) => {
      setCreated(key);
      setName("");
      void invalidate();
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to create key"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => accountApi.revokeApiKey(id),
    onSuccess: () => {
      void invalidate();
      toast.success("Key revoked");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Failed to revoke"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() && tenantId) createMutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API keys (MCP)</CardTitle>
        <CardDescription>
          Personal keys to reach the tenant over MCP from Cursor and other tools. Each key is scoped
          to one tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
          <div className="grid min-w-40 flex-1 gap-2">
            <Label htmlFor="key-name">Name</Label>
            <Input
              id="key-name"
              placeholder="e.g. Cursor"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key-tenant">Tenant</Label>
            <select
              id="key-tenant"
              className={roleSelectClass}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
            {createMutation.isPending ? "Creating..." : "Create key"}
          </Button>
        </form>

        {created && <CreatedKeyPanel created={created} />}

        {keys && keys.length > 0 && (
          <div className="grid gap-2 border-t pt-4">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{key.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    <code className="font-mono">{key.prefix}…</code> · {key.tenantName} ·{" "}
                    {key.lastUsedAt
                      ? `used ${new Date(key.lastUsedAt).toLocaleDateString("en-US")}`
                      : "never used"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (window.confirm(`Revoke the key "${key.name}"?`)) {
                      revokeMutation.mutate(key.id);
                    }
                  }}
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

export function AccountPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My account</h1>
        <p className="text-muted-foreground">Profile and security</p>
      </div>
      <ProfileSection />
      <PasswordSection />
      <ApiKeysSection />
    </div>
  );
}
