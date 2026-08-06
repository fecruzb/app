import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Trash2Icon, UploadIcon } from "lucide-react";
import type { ImageDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { useConfirm } from "@app/ui/confirm-dialog";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { useTenant } from "@/domains/tenant/context/tenant-provider";
import { imageApi } from "../api";

export function ImagesPage() {
  const { t } = useTranslation();
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: images, isLoading } = useQuery({
    queryKey: ["images", tenant.id],
    queryFn: () => imageApi.list(tenant.id),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["images", tenant.id] });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => imageApi.upload(tenant.id, file),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, t("images.uploadFailed")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => imageApi.delete(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, t("images.deleteFailed")),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  }

  async function handleDelete(image: ImageDto) {
    const ok = await confirm({
      title: t("images.deleteTitle"),
      description: t("images.deleteDescription"),
      confirmLabel: t("common.delete"),
      destructive: true,
    });
    if (ok) deleteMutation.mutate(image.id);
  }

  const description =
    t("images.description") +
    (images && images.length > 0 ? t("images.total", { count: images.length }) : "");

  return (
    <div className="grid gap-6">
      <PageHeader title={t("images.title")} description={description} />

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          <UploadIcon /> {uploadMutation.isPending ? t("images.uploading") : t("images.upload")}
        </Button>
      </div>

      {isLoading ? (
        <PageLoading />
      ) : images && images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-xl border">
              <img src={image.url} alt="" className="aspect-square w-full object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => void handleDelete(image)}
              >
                <Trash2Icon />
                <span className="sr-only">{t("common.delete")}</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>{t("images.empty")}</EmptyState>
      )}
    </div>
  );
}
