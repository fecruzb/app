import type { ReactNode } from "react";
import { CheckIcon } from "lucide-react";
import { ContentScaleProvider } from "@app/ui/content-scale";
import { cn } from "@app/ui/lib/utils";

type Density = "loose" | "normal" | "tight";

type FeatureSplitProps = {
  eyebrow: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  /** Check-marked bullets under the body. */
  points?: readonly string[];
  /** Extra copy-column content (live controls, CTAs…). */
  children?: ReactNode;
  visual: ReactNode;
  /** Swap columns — copy on the right, visual on the left. */
  flip?: boolean;
  /** Top hairline separator from the previous block. */
  bordered?: boolean;
  /**
   * Vertical rhythm + title scale.
   * - `loose` — foundations / theming / i18n
   * - `normal` — product-tour chapters
   * - `tight` — database / resource subsections
   */
  density?: Density;
  /**
   * Zoom for the body inside chrome frames (CodeBlock / Window / Explorer).
   * Never shrinks the title bar, traffic lights, or activity bar — those stay
   * at 1× via ContentScaleProvider. Omit to use the density default.
   */
  visualScale?: number;
  headingAs?: "h2" | "h3" | "h4";
  className?: string;
};

const defaultVisualScale: Record<Density, number> = {
  loose: 1,
  normal: 0.92,
  tight: 0.82,
};

/**
 * Marketing feature row: copy on one side, visual on the other.
 * Alternating `flip` keeps long pages from reading as a wall.
 */
export function FeatureSplit({
  eyebrow,
  title,
  body,
  points,
  children,
  visual,
  flip = false,
  bordered = false,
  density = "normal",
  visualScale,
  headingAs = "h3",
  className,
}: FeatureSplitProps) {
  const Heading = headingAs;
  const scale = visualScale ?? defaultVisualScale[density];

  return (
    <section
      data-section
      className={cn(
        "scroll-mt-20 px-4",
        bordered && "border-t",
        density === "loose" && "py-16 sm:py-20",
        density === "normal" && "py-10 sm:py-12",
        density === "tight" && "py-8 sm:py-10",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto grid max-w-5xl items-center lg:grid-cols-2 lg:gap-14",
          density === "tight" ? "gap-8" : "gap-10",
        )}
      >
        <div className={cn("reveal min-w-0", flip && "lg:order-2")}>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">{eyebrow}</p>
          <Heading
            className={cn(
              "font-semibold tracking-tight text-balance",
              density === "tight" ? "mt-1.5 text-xl sm:text-2xl" : "mt-2 text-2xl sm:text-3xl",
            )}
          >
            {title}
          </Heading>
          {body ? (
            <p
              className={cn(
                "text-pretty text-muted-foreground",
                density === "tight" ? "mt-3" : "mt-4",
              )}
            >
              {body}
            </p>
          ) : null}
          {points && points.length > 0 ? (
            <ul
              className={cn("text-sm", density === "tight" ? "mt-5 space-y-2.5" : "mt-6 space-y-3")}
            >
              {points.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {children ? <div className="mt-6">{children}</div> : null}
        </div>

        <div className={cn("reveal reveal-delay min-w-0", flip && "lg:order-1")}>
          <ContentScaleProvider scale={scale}>{visual}</ContentScaleProvider>
        </div>
      </div>
    </section>
  );
}
