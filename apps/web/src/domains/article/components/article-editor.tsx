import { useRef, type MutableRefObject } from "react";
import { Crepe, CrepeFeature } from "@milkdown/crepe";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { cn } from "@app/ui/lib/utils";

type ArticleEditorProps = {
  /** Initial Markdown; remount with a new `key` when the document changes. */
  defaultValue: string;
  readonly?: boolean;
  placeholder?: string;
  className?: string;
  /** Called whenever the Markdown document changes. */
  onChange?: (markdown: string) => void;
};

/**
 * Milkdown Crepe editor for article bodies. Keep a ref via `onReady` or read
 * Markdown through the `onChange` callback when saving.
 */
function ArticleEditorInner({
  defaultValue,
  readonly = false,
  placeholder,
  className,
  onChange,
  onReady,
}: ArticleEditorProps & { onReady?: (crepe: Crepe) => void }) {
  useEditor((root) => {
    const crepe = new Crepe({
      root,
      defaultValue,
      features: {
        [CrepeFeature.ImageBlock]: false,
        [CrepeFeature.Latex]: false,
        [CrepeFeature.AI]: false,
        ...(readonly
          ? {
              [CrepeFeature.BlockEdit]: false,
              [CrepeFeature.Toolbar]: false,
              [CrepeFeature.LinkTooltip]: false,
              [CrepeFeature.Placeholder]: false,
            }
          : {}),
      },
      featureConfigs: {
        [CrepeFeature.Placeholder]: {
          text: placeholder ?? "Write something…",
        },
        [CrepeFeature.BlockEdit]: {
          blockHandle: {
            getOffset: () => 8,
          },
        },
      },
    });
    if (readonly) crepe.setReadonly(true);
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        onChange?.(markdown);
      });
    });
    onReady?.(crepe);
    return crepe;
  }, []);

  return (
    <div
      className={cn(
        "article-editor",
        // Gutter overhang: + / drag sit left of the text column so prose
        // shares the same left edge as the title/cover above.
        !readonly && "article-editor--editable",
        readonly && "pointer-events-none",
        className,
      )}
    >
      <Milkdown />
    </div>
  );
}

export type ArticleEditorHandle = {
  getMarkdown: () => string;
};

/**
 * WYSIWYG Markdown editor (Milkdown Crepe). Pass `editorRef` to read Markdown
 * on save; remount with `key` when switching articles.
 */
export function ArticleEditor({
  editorRef,
  ...props
}: ArticleEditorProps & { editorRef?: MutableRefObject<ArticleEditorHandle | null> }) {
  const crepeRef = useRef<Crepe | null>(null);

  return (
    <MilkdownProvider>
      <ArticleEditorInner
        {...props}
        onReady={(crepe) => {
          crepeRef.current = crepe;
          if (editorRef) {
            editorRef.current = {
              getMarkdown: () => crepe.getMarkdown(),
            };
          }
        }}
      />
    </MilkdownProvider>
  );
}
