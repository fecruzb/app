import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@app/ui/lib/utils";

const SECTION_SEL = "[data-section]";
/** Past the sticky header + a little slack so “current” doesn’t re-pick itself. */
const TOP_SLACK = 96;

function nextSection(): HTMLElement | undefined {
  const y = window.scrollY + TOP_SLACK;
  return [...document.querySelectorAll<HTMLElement>(SECTION_SEL)].find((el) => el.offsetTop > y);
}

/**
 * Fixed, discreet control on the right — jumps to the next `[data-section]`
 * below the viewport. Hides when there’s nowhere left to go.
 */
export function NextSectionButton() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const sync = () => setHasNext(Boolean(nextSection()));
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [pathname]);

  return (
    <button
      type="button"
      onClick={() => nextSection()?.scrollIntoView({ behavior: "smooth", block: "start" })}
      aria-label={t("landing.nextSection")}
      tabIndex={hasNext ? 0 : -1}
      className={cn(
        "next-section-pulse fixed right-3 bottom-5 z-20 flex size-9 items-center justify-center rounded-full border bg-background/80 text-muted-foreground shadow-sm backdrop-blur transition-[opacity,color,border-color] hover:border-foreground/20 hover:text-foreground md:right-5 md:bottom-8",
        hasNext ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <ChevronDownIcon className="size-4" aria-hidden />
    </button>
  );
}
