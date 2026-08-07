import { Trans, useTranslation } from "react-i18next";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { brand, type CreatedApiKeyDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { Label } from "@app/ui/label";

async function copyToClipboard(text: string, copied: string, failed: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(copied);
  } catch {
    toast.error(failed);
  }
}

/** Shown once, right after creating a key: the raw value and a ready mcp.json. */
export function CreatedKeyPanel({ created }: { created: CreatedApiKeyDto }) {
  const { t } = useTranslation();
  const mcpConfig = JSON.stringify(
    {
      mcpServers: {
        [brand.mcpServerName]: {
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
