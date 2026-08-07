import { cn } from "@app/ui/lib/utils";

/**
 * Product mark used in app / auth / admin / marketing shells.
 * Swap the SVG paths (or render an `<img>`) when rebranding — keep using
 * `currentColor` so `text-primary` / theme tokens still tint the mark.
 */
export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-5 shrink-0 text-primary", className)}
      aria-hidden
    >
      {/* Solid base carrying an open shape — the groundwork is done, the product is yours. */}
      <rect
        x="6.75"
        y="3.75"
        width="10.5"
        height="10.5"
        rx="2.9"
        transform="rotate(45 12 9)"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <rect x="4.5" y="18.5" width="15" height="2.8" rx="1.4" fill="currentColor" />
    </svg>
  );
}
