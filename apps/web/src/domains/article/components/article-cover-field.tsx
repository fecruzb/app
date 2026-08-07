import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlusIcon, SparklesIcon, Trash2Icon } from "lucide-react";
import { Button } from "@app/ui/button";
import { cn } from "@app/ui/lib/utils";

type ArticleCoverFieldProps = {
  coverUrl: string | null;
  disabled?: boolean;
  generating?: boolean;
  /** When false, hide the AI generate button. */
  canGenerate?: boolean;
  onUpload: (file: File) => void;
  onGenerate: () => void;
  onRemove: () => void;
};

/**
 * Cover image area: placeholder or preview, with generate / upload / remove.
 */
export function ArticleCoverField({
  coverUrl,
  disabled,
  generating,
  canGenerate = true,
  onUpload,
  onGenerate,
  onRemove,
}: ArticleCoverFieldProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = disabled || generating;

  return (
    <div className="grid gap-3">
      <div
        className={cn(
          "relative flex aspect-[2/1] items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/30",
          coverUrl && "border-solid border-border",
        )}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <p className="px-4 text-center text-sm text-muted-foreground">{t("articles.noCover")}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onUpload(file);
          }}
        />
        {canGenerate ? (
          <Button type="button" variant="outline" disabled={busy} onClick={onGenerate}>
            <SparklesIcon />
            {generating ? t("articles.generatingCover") : t("articles.generateCover")}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon />
          {coverUrl ? t("articles.replaceCover") : t("articles.uploadCover")}
        </Button>
        {coverUrl ? (
          <Button type="button" variant="ghost" disabled={busy} onClick={onRemove}>
            <Trash2Icon />
            {t("articles.removeCover")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
