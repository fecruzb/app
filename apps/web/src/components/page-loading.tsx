import { Loader2Icon } from "lucide-react";

/** Centered spinner for pending queries. */
export function PageLoading() {
  return (
    <div className="flex justify-center py-12">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
