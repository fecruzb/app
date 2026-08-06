import { Card, CardContent } from "@/components/ui/card";

/** Placeholder card shown when a list has no items. */
export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-muted-foreground">{children}</CardContent>
    </Card>
  );
}
