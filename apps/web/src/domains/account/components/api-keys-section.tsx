import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import type { CreatedApiKeyDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { EmptyState } from "@app/ui/empty-state";
import { Input } from "@app/ui/input";
import { Label } from "@app/ui/label";
import { useConfirm } from "@app/ui/confirm-dialog";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { dateLocale } from "@/i18n";
import { useAuth } from "@/domains/auth/context/auth-provider";
import { accountApi } from "../api";
import { CreatedKeyPanel } from "./created-key-panel";

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-2";

export function ApiKeysSection() {
  const { t, i18n } = useTranslation();
  const { me } = useAuth();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const tenants = me?.tenants ?? [];
  const [name, setName] = useState("");
  const [tenantId, setTenantId] = useState(tenants[0]?.id ?? "");
  const [created, setCreated] = useState<CreatedApiKeyDto | null>(null);

  const { data: keys, isLoading } = useQuery({
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
      cancelLabel: t("common.cancel"),
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

        {isLoading ? (
          <PageLoading />
        ) : !keys?.length ? (
          <EmptyState>{t("integrations.noKeys")}</EmptyState>
        ) : (
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
