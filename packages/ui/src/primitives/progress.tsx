import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const progressTrackVariants = cva("relative w-full overflow-hidden rounded-full", {
  variants: {
    variant: {
      default: "bg-primary/20",
      destructive: "bg-destructive/20",
      secondary: "bg-secondary",
    },
    size: {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-3.5",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

const progressIndicatorVariants = cva("h-full rounded-full transition-[width] duration-300 ease-out", {
  variants: {
    variant: {
      default: "bg-primary",
      destructive: "bg-destructive",
      secondary: "bg-foreground/70",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ProgressProps = Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof progressTrackVariants> & {
    /** Progress value. Clamped to `0…max`. */
    value?: number;
    /** Upper bound for `value`. Defaults to `100`. */
    max?: number;
    /** Show a `N%` label to the right of the bar. */
    showValue?: boolean;
    /** Override the percent label (e.g. i18n). Receives the clamped 0–100 percent. */
    formatValue?: (percent: number) => React.ReactNode;
    /** Classes for the filled indicator. */
    indicatorClassName?: string;
  };

function clampPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/**
 * Pill progress bar. Use alone, or with `showValue` for bar + percent
 * (compose label / chevron outside — keep this atomic).
 */
function Progress({
  className,
  value = 0,
  max = 100,
  size,
  variant,
  showValue = false,
  formatValue,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const percent = clampPercent(value, max);
  const label = formatValue ? formatValue(percent) : `${Math.round(percent)}%`;

  const bar = (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      data-slot="progress"
      className={cn(progressTrackVariants({ size, variant }), !showValue && className)}
      {...(!showValue ? props : undefined)}
    >
      <div
        data-slot="progress-indicator"
        className={cn(progressIndicatorVariants({ variant }), indicatorClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );

  if (!showValue) {
    return bar;
  }

  return (
    <div
      data-slot="progress-with-value"
      className={cn("inline-flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <div className="min-w-0 flex-1">{bar}</div>
      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">{label}</span>
    </div>
  );
}

export { Progress, progressTrackVariants, progressIndicatorVariants };
