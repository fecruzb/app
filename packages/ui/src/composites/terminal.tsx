import { Window } from "./browser-window";
import { cn } from "../lib/utils";

export type TerminalLine = {
  text: string;
  /** Command line — shows a `$` prompt. */
  prompt?: boolean;
  /** Dimmer output / commentary. */
  muted?: boolean;
};

type TerminalProps = {
  /** Title pill (e.g. `bash — migrations`). Caller supplies copy. */
  label: string;
  lines: TerminalLine[];
  className?: string;
  /** Accessible name for the mock — defaults to label. */
  ariaLabel?: string;
};

/**
 * Bash / terminal chrome for docs and marketing mocks.
 * App-neutral: pass every string from the caller (no product copy here).
 */
function Terminal({ label, lines, className, ariaLabel }: TerminalProps) {
  return (
    <Window label={label} className={className}>
      <div
        className="space-y-1 bg-card p-4 font-mono text-xs leading-relaxed"
        role="img"
        aria-label={ariaLabel ?? label}
      >
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.prompt ? (
              <span className="shrink-0 text-primary">$</span>
            ) : (
              <span className="shrink-0 text-transparent" aria-hidden>
                $
              </span>
            )}
            <span className={cn(line.muted && "text-muted-foreground")}>{line.text}</span>
          </div>
        ))}
      </div>
    </Window>
  );
}

export { Terminal };
