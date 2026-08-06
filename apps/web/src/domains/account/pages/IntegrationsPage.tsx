import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { CopyIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { CreatedApiKeyDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { useConfirm } from "@app/ui/confirm-dialog";
import { PageHeader } from "@app/ui/page-header";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { useAuth } from "@/domains/auth/auth-provider";
import { accountApi } from "../api";

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

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
        <p className="text-sm font-medium">{t("integrations.copyKeyNow")}</p>
        <p className="text-xs text-muted-foreground">
          <Trans
            i18nKey="integrations.scopedTo"
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
            void copyToClipboard(
              created.key,
              t("integrations.copied"),
              t("integrations.copyFailed"),
            )
          }
        >
          <CopyIcon />
          <span className="sr-only">{t("integrations.copyKey")}</span>
        </Button>
      </div>
      <div className="grid gap-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs">{t("integrations.addToMcp")}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void copyToClipboard(
                mcpConfig,
                t("integrations.copied"),
                t("integrations.copyFailed"),
              )
            }
          >
            <CopyIcon /> {t("integrations.copyConfig")}
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
    onError: (err) => showApiError(err, t("integrations.createKeyFailed")),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => accountApi.revokeApiKey(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("integrations.keyRevoked"));
    },
    onError: (err) => showApiError(err, t("integrations.revokeKeyFailed")),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim() && tenantId) createMutation.mutate();
  }

  async function handleRevoke(id: string, keyName: string) {
    const ok = await confirm({
      title: t("integrations.revokeKeyTitle"),
      description: t("integrations.revokeKeyDescription", { name: keyName }),
      confirmLabel: t("common.revoke"),
      destructive: true,
    });
    if (ok) revokeMutation.mutate(id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("integrations.apiKeys")}</CardTitle>
        <CardDescription>{t("integrations.apiKeysDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
          <div className="grid min-w-40 flex-1 gap-2">
            <Label htmlFor="key-name">{t("common.name")}</Label>
            <Input
              id="key-name"
              placeholder={t("integrations.keyNamePlaceholder")}
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
            {createMutation.isPending ? t("common.creating") : t("integrations.createKey")}
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
                      ? t("integrations.used", {
                          date: new Date(key.lastUsedAt).toLocaleDateString(
                            dateLocale(i18n.language),
                          ),
                        })
                      : t("integrations.neverUsed")}
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

export function IntegrationsPage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("integrations.title")} description={t("integrations.description")} />
      <ApiKeysSection />
    </div>
  );
}
