import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@app/ui/card";
import { cn } from "@app/ui/lib/utils";
import { usageApi } from "./api";

/** Amounts travel as micro-dollars (USD * 1_000_000). */
function formatUsd(micros: number): string {
  if (micros > 0 && micros < 10_000) return "<$0.01";
  return `$${(micros / 1_000_000).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function AiUsageCard() {
  const { data: usage } = useQuery({
    queryKey: ["ai-usage"],
    queryFn: usageApi.getAi,
  });

  if (!usage) return null;

  const capped = usage.limitMicros > 0;
  const percent = capped ? Math.min(100, (usage.spentMicros / usage.limitMicros) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI usage</CardTitle>
        <CardDescription>
          {capped
            ? `Monthly assistant budget — resets on ${formatDate(usage.periodEnd)}`
            : "Assistant usage this month — no budget limit is set"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-medium">
            {formatUsd(usage.spentMicros)}
            {capped && (
              <span className="text-muted-foreground"> of {formatUsd(usage.limitMicros)}</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {usage.requestCount} {usage.requestCount === 1 ? "request" : "requests"}
          </span>
        </div>

        {capped && (
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                usage.overLimit ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {usage.overLimit && (
          <p className="text-xs text-destructive">
            Monthly limit reached — the assistant is paused until {formatDate(usage.periodEnd)}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
