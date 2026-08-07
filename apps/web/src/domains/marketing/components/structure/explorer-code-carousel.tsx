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
   * Order in the `examples` array is the toggle order (after Files).
   */
  mode: "code" | "index";
};

type ExplorerCodeCarouselProps = {
  /** VS Code explorer (or any tree chrome). */
  tree: ReactNode;
  /**
   * Code slides after Files — order matters.
   * Typical zoom-in: file outline (index) → one unit (code).
   */
  examples: CodeExample[];
};

/** Toggle label = file basename (or the part after " → "). */
function fileTabLabel(filename: string): string {
  const focus = filename.includes(" → ")
    ? filename.slice(filename.indexOf(" → ") + 3).trim()
    : filename;
  return focus.split("/").pop() ?? focus;
}

/**
 * Same visual slot: tree ↔ code(s). Height stays stable (grid stack).
 * Toggle: Files, then each example in array order (filenames as labels).
 */
export function ExplorerCodeCarousel({ tree, examples }: ExplorerCodeCarouselProps) {
  const { t } = useTranslation();
  /** null = Files; otherwise index into `examples`. */
  const [slide, setSlide] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="grid">
        <Slide visible={slide === null}>{tree}</Slide>
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
        aria-label={t("landing.apiCourse.carouselLabel")}
      >
        <div className="flex max-w-full flex-wrap justify-center rounded-md border bg-muted/40 p-0.5">
          <ModeButton
            active={slide === null}
            label={t("landing.apiCourse.slideTree")}
            short={t("landing.apiCourse.modeFiles")}
            icon={FolderTreeIcon}
            onClick={() => setSlide(null)}
          />
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
