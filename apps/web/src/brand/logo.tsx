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
      <path
        d="M3.5 8.5 12 3.5l8.5 5v7L12 20.5l-8.5-5v-7Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 8.5 12 13.5l8.5-5M12 13.5V20.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
