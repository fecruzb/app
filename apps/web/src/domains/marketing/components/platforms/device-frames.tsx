import type { ReactNode } from "react";
import { cn } from "@app/ui/lib/utils";
import { ScaledContent } from "@app/ui/content-scale";

type DesktopVariant = "macos" | "windows" | "linux";

/**
 * Native-app window chrome (not a browser URL bar) — title strip + body.
 * macOS gets traffic lights; Windows/Linux get caption-style controls.
 */
export function DesktopAppFrame({
  title,
  variant = "macos",
  children,
  className,
}: {
  title: string;
  variant?: DesktopVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-md ring-1 ring-foreground/5",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b bg-muted/70 px-3 py-2 dark:bg-muted/40">
        {variant === "macos" ? (
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1 text-muted-foreground" aria-hidden>
            <span className="flex size-5 items-center justify-center rounded-sm text-[10px]">
              ─
            </span>
            <span className="flex size-5 items-center justify-center rounded-sm text-[10px]">
              □
            </span>
            <span className="flex size-5 items-center justify-center rounded-sm text-[10px]">
              ✕
            </span>
          </div>
        )}
        <p className="min-w-0 flex-1 truncate text-center text-[11px] font-medium text-muted-foreground">
          {title}
        </p>
        <div className="w-[46px] shrink-0" aria-hidden />
      </div>
      <ScaledContent>
        <div className="min-h-56">{children}</div>
      </ScaledContent>
    </div>
  );
}

/** Phone bezel with notch and home indicator — wraps app UI for mobile platforms. */
export function PhoneFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  /** Optional status-bar caption (e.g. 9:41). */
  label?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-[220px] overflow-hidden rounded-[2rem] border-[5px] border-foreground/90 bg-background shadow-xl ring-1 ring-foreground/10",
        className,
      )}
    >
      <div className="relative flex h-7 items-end justify-center bg-background pb-1">
        <div className="h-4 w-20 rounded-full bg-foreground/90" aria-hidden />
        {label ? (
          <span className="absolute left-4 top-1.5 text-[9px] font-medium text-muted-foreground">
            {label}
          </span>
        ) : null}
      </div>
      <ScaledContent>
        <div className="max-h-[340px] overflow-hidden">{children}</div>
      </ScaledContent>
      <div className="flex justify-center bg-background py-2" aria-hidden>
        <div className="h-1 w-16 rounded-full bg-foreground/25" />
      </div>
    </div>
  );
}

/**
 * Stacked phones — side cards peek behind the center one so the cascade reads
 * as several devices running the same app.
 */
export function PhoneCascade({
  front,
  backLeft,
  backRight,
  className,
}: {
  front: ReactNode;
  backLeft: ReactNode;
  backRight: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto h-[420px] w-full max-w-md", className)}>
      <div
        className="absolute top-10 left-[8%] z-0 origin-bottom scale-[0.88] rotate-[-10deg] opacity-55"
        aria-hidden
      >
        <PhoneFrame>{backLeft}</PhoneFrame>
      </div>
      <div
        className="absolute top-10 right-[8%] z-0 origin-bottom scale-[0.88] rotate-[10deg] opacity-55"
        aria-hidden
      >
        <PhoneFrame>{backRight}</PhoneFrame>
      </div>
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2">
        <PhoneFrame label="9:41">{front}</PhoneFrame>
      </div>
    </div>
  );
}
