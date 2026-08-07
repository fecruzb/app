import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FileCode2Icon, FolderTreeIcon } from "lucide-react";
import { CodeBlock } from "@app/ui/code-block";
import { cn } from "@app/ui/lib/utils";

export type CodeExample = {
  /** Shown in the CodeBlock chrome (may include path). */
  filename: string;
  code: string;
  lang?: "ts" | "text";
  /**
   * code = one unit (handler / method / tool).
   * index = full map / all methods.
   * Order in the `examples` array is the toggle order (after Files, if any).
   */
  mode: "code" | "index";
};

type ExplorerCodeCarouselProps = {
  /**
   * VS Code explorer (or any tree chrome). Omit for code-only toggles
   * (starts on the first example — no Files tab).
   */
  tree?: ReactNode;
  /**
   * Code slides — order matters.
   * Typical zoom-in: file outline (index) → one unit (code).
   */
  examples: CodeExample[];
  /** i18n prefix for Files / aria labels. */
  labelsNamespace?: "landing.apiCourse" | "landing.webCourse" | "landing.dbCourse";
};

/** Toggle label = file basename (or the part after " → "). */
function fileTabLabel(filename: string): string {
  const focus = filename.includes(" → ")
    ? filename.slice(filename.indexOf(" → ") + 3).trim()
    : filename;
  return focus.split("/").pop() ?? focus;
}

/**
 * Same visual slot: optional tree ↔ code(s). Height stays stable (grid stack).
 * Toggle: Files (if tree), then each example in array order (filenames as labels).
 */
export function ExplorerCodeCarousel({
  tree,
  examples,
  labelsNamespace = "landing.apiCourse",
}: ExplorerCodeCarouselProps) {
  const { t } = useTranslation();
  const hasTree = tree != null;
  /** null = Files; otherwise index into `examples`. */
  const [slide, setSlide] = useState<number | null>(hasTree ? null : 0);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="grid">
        {hasTree ? <Slide visible={slide === null}>{tree}</Slide> : null}
        {examples.map((example, i) => (
          <Slide key={`${example.mode}-${example.filename}`} visible={slide === i}>
            <CodeBlock
              filename={example.filename}
              code={example.code}
              lang={example.lang ?? "ts"}
            />
          </Slide>
        ))}
      </div>

      <div
        className="mt-3 flex justify-center"
        role="group"
        aria-label={t(`${labelsNamespace}.carouselLabel`)}
      >
        <div className="flex max-w-full flex-wrap justify-center rounded-md border bg-muted/40 p-0.5">
          {hasTree ? (
            <ModeButton
              active={slide === null}
              label={t(`${labelsNamespace}.slideTree`)}
              short={t(`${labelsNamespace}.modeFiles`)}
              icon={FolderTreeIcon}
              onClick={() => setSlide(null)}
            />
          ) : null}
          {examples.map((example, i) => (
            <ModeButton
              key={`${example.mode}-${example.filename}`}
              active={slide === i}
              label={example.filename}
              short={fileTabLabel(example.filename)}
              icon={FileCode2Icon}
              mono
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Slide({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "col-start-1 row-start-1 min-w-0",
        visible ? "visible z-10" : "pointer-events-none invisible z-0",
      )}
      aria-hidden={!visible}
    >
      {children}
    </div>
  );
}

function ModeButton({
  active,
  label,
  short,
  icon: Icon,
  mono,
  onClick,
}: {
  active: boolean;
  label: string;
  short: string;
  icon: typeof FileCode2Icon;
  mono?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-7 max-w-[11rem] items-center gap-1 rounded-[5px] px-2.5 text-[11px] font-medium transition-colors",
        mono && "font-mono text-[10px] tracking-tight",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{short}</span>
    </button>
  );
}
