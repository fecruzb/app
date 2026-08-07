import type { ReactNode } from "react";
import { cn } from "@app/ui/lib/utils";

type MarketingHeroProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  body: ReactNode;
  children?: ReactNode;
  /** Landing uses a taller, louder treatment; page/section openers stay compact. */
  size?: "lg" | "md";
  align?: "center" | "left";
  /** Mid-page section intros use `h2` so the page keeps a single `h1`. */
  headingAs?: "h1" | "h2";
  className?: string;
};

/**
 * Shared marketing opener — tinted atmosphere, large title, optional CTA slot.
 * Used for page heroes and mid-page section intros (database, example resource…).
 * Pair with `useReveal()` on the page so the staggered `.reveal` classes animate in.
 */
export function MarketingHero({
  eyebrow,
  title,
  body,
  children,
  size = "md",
  align = "center",
  headingAs,
  className,
}: MarketingHeroProps) {
  const centered = align === "center";
  const Heading = headingAs ?? "h1";

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Atmosphere fades into the page background — no hard border under the hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
      >
        <div className="absolute inset-0 bg-muted/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)]" />
        <div
          className={cn(
            "absolute inset-0 opacity-[0.4] dark:opacity-[0.25]",
            "[background-image:linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_7%,transparent)_1px,transparent_1px)]",
            "[background-size:40px_40px]",
            "[mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)]",
          )}
        />
      </div>

      <div
        className={cn(
          "relative mx-auto w-full px-4",
          size === "lg" ? "max-w-5xl py-24 sm:py-32" : "max-w-3xl pt-20 pb-12 sm:pb-14",
          centered && "text-center",
          !centered && size === "md" && "max-w-5xl",
        )}
      >
        <p
          className={cn(
            "reveal text-sm font-semibold text-primary",
            size === "md" && "tracking-wide uppercase",
            size === "lg" && "mb-4",
            centered && "flex items-center justify-center gap-2",
            !centered && "flex items-center gap-2",
          )}
        >
          {eyebrow}
        </p>
        <Heading
          className={cn(
            "reveal reveal-delay font-bold tracking-tight text-balance",
            size === "lg"
              ? "mx-auto max-w-3xl text-4xl sm:text-5xl md:text-6xl"
              : "mt-3 text-3xl sm:text-4xl",
            centered && size === "md" && "mx-auto max-w-2xl",
          )}
        >
          {title}
        </Heading>
        <p
          className={cn(
            "reveal reveal-delay-2 text-pretty text-muted-foreground",
            size === "lg" ? "mx-auto mt-6 max-w-xl text-lg" : "mt-4 max-w-2xl text-base",
            centered && "mx-auto",
          )}
        >
          {body}
        </p>
        {children ? (
          <div className={cn("reveal reveal-delay-3", size === "lg" ? "mt-8" : "mt-6")}>
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
