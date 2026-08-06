import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, UploadIcon } from "lucide-react";
import type { ImageDto } from "@app/shared";
import { Button } from "@app/ui/button";
import { useConfirm } from "@app/ui/confirm-dialog";
import { EmptyState } from "@app/ui/empty-state";
import { PageHeader } from "@app/ui/page-header";
import { PageLoading } from "@app/ui/page-loading";
import { showApiError } from "@/lib/api";
import { useTenant } from "@/domains/tenant/tenant-provider";
import { imageApi } from "../api";

export function ImagesPage() {
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
    onError: (err) => showApiError(err, "Failed to upload image"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => imageApi.delete(tenant.id, id),
    onSuccess: () => void invalidate(),
    onError: (err) => showApiError(err, "Failed to delete image"),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = "";
  }

  async function handleDelete(image: ImageDto) {
    const ok = await confirm({
      title: "Delete image",
      description: "This can't be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(image.id);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Images"
        description={`Upload and manage the tenant's images${
          images && images.length > 0 ? ` · ${images.length} total` : ""
        }`}
      />

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          <UploadIcon /> {uploadMutation.isPending ? "Uploading..." : "Upload image"}
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
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>No images yet. Upload the first one!</EmptyState>
      )}
    </div>
  );
}
