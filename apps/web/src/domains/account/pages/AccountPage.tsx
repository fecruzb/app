import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { CopyIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { CreatedApiKeyDto } from "@app/shared";
import { Badge } from "@app/ui/badge";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { useConfirm } from "@app/ui/confirm-dialog";
import { PageHeader } from "@app/ui/page-header";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { useAppConfig } from "@/app/config";
import { useAuth } from "@/domains/auth/auth-provider";
import { AiUsageCard } from "@/domains/usage/ai-usage-card";
import { accountApi } from "../api";

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

function ProfileSection() {
  const { t } = useTranslation();
  const { me, refresh } = useAuth();
  const [name, setName] = useState(me?.user.name ?? "");

  const mutation = useMutation({
    mutationFn: () => accountApi.updateProfile({ name }),
    onSuccess: async () => {
      await refresh();
      toast.success(t("account.profileUpdated"));
    },
    onError: (err) => showApiError(err, t("account.saveFailed")),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.profile")}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          {me?.user.email}
          {me?.user.emailVerified ? (
            <Badge variant="secondary">{t("account.verified")}</Badge>
          ) : (
            <Badge variant="outline">{t("account.unverified")}</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex items-end gap-2"
        >
          <div className="grid flex-1 gap-2">
            <Label htmlFor="account-name">{t("common.name")}</Label>
            <Input
              id="account-name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={mutation.isPending || name === me?.user.name}>
            {mutation.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => accountApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t("account.passwordChanged"));
    },
    onError: (err) => showApiError(err, t("account.changePasswordFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.password")}</CardTitle>
        <CardDescription>{t("account.passwordDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">{t("account.currentPassword")}</Label>
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
            <Label htmlFor="new-password">{t("account.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("common.minPassword")}</p>
          </div>
          <div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t("common.saving") : t("account.changePassword")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

async function copyToClipboard(text: string, copied: string, failed: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(copied);
  } catch {
    toast.error(failed);
  }
}

/** Shown once, right after creating a key: the raw value and a ready mcp.json. */
function CreatedKeyPanel({ created }: { created: CreatedApiKeyDto }) {
  const { t } = useTranslation();
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
        <p className="text-sm font-medium">{t("account.copyKeyNow")}</p>
        <p className="text-xs text-muted-foreground">
          <Trans
            i18nKey="account.scopedTo"
            values={{ tenant: created.tenantName }}
            components={{ strong: <strong /> }}
          />
        </p>
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-md border bg-background px-3 py-2 font-mono text-xs">
          {created.key}
        </code>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            void copyToClipboard(created.key, t("account.copied"), t("account.copyFailed"))
          }
        >
          <CopyIcon />
          <span className="sr-only">{t("account.copyKey")}</span>
        </Button>
      </div>
      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t("account.addToMcp")}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void copyToClipboard(mcpConfig, t("account.copied"), t("account.copyFailed"))
            }
          >
            <CopyIcon /> {t("account.copyConfig")}
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
  const { t, i18n } = useTranslation();
  const { me } = useAuth();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
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
    onError: (err) => showApiError(err, t("account.createKeyFailed")),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => accountApi.revokeApiKey(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("account.keyRevoked"));
    },
    onError: (err) => showApiError(err, t("account.revokeKeyFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() && tenantId) createMutation.mutate();
  }

  async function handleRevoke(id: string, keyName: string) {
    const ok = await confirm({
      title: t("account.revokeKeyTitle"),
      description: t("account.revokeKeyDescription", { name: keyName }),
      confirmLabel: t("common.revoke"),
      destructive: true,
    });
    if (ok) revokeMutation.mutate(id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.apiKeys")}</CardTitle>
        <CardDescription>{t("account.apiKeysDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
          <div className="grid min-w-40 flex-1 gap-2">
            <Label htmlFor="key-name">{t("common.name")}</Label>
            <Input
              id="key-name"
              placeholder={t("account.keyNamePlaceholder")}
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key-tenant">{t("common.tenant")}</Label>
            <select
              id="key-tenant"
              className={selectClass}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              {tenants.map((tenantOption) => (
                <option key={tenantOption.id} value={tenantOption.id}>
                  {tenantOption.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
            {createMutation.isPending ? t("common.creating") : t("account.createKey")}
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
                      ? t("account.used", {
                          date: new Date(key.lastUsedAt).toLocaleDateString(
                            dateLocale(i18n.language),
                          ),
                        })
                      : t("account.neverUsed")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleRevoke(key.id, key.name)}
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

export function AccountPage() {
  const { t } = useTranslation();
  const { aiEnabled } = useAppConfig();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("account.title")} description={t("account.description")} />
      <ProfileSection />
      {aiEnabled && <AiUsageCard />}
      <PasswordSection />
      <ApiKeysSection />
    </div>
  );
}
