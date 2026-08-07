import { useRef, type MutableRefObject } from "react";
import { useTranslation } from "react-i18next";
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

type Translate = (key: string) => string;

/** Crepe chrome labels from the app locale (toolbar, slash menu, link tooltip). */
function crepeFeatureConfigs(t: Translate, placeholder: string) {
  return {
    [CrepeFeature.Placeholder]: {
      text: placeholder,
    },
    [CrepeFeature.Toolbar]: {
      boldLabel: t("articles.editor.bold"),
      italicLabel: t("articles.editor.italic"),
      strikethroughLabel: t("articles.editor.strikethrough"),
      codeLabel: t("articles.editor.code"),
      linkLabel: t("articles.editor.link"),
    },
    [CrepeFeature.LinkTooltip]: {
      inputPlaceholder: t("articles.editor.linkPlaceholder"),
    },
    [CrepeFeature.BlockEdit]: {
      blockHandle: {
        // Sit in the left margin; fixed so they never expand layout width.
        getOffset: () => 8,
        floatingUIOptions: { strategy: "fixed" as const },
      },
      textGroup: {
        label: t("articles.editor.textGroup"),
        text: { label: t("articles.editor.text") },
        h1: { label: t("articles.editor.heading1") },
        h2: { label: t("articles.editor.heading2") },
        h3: { label: t("articles.editor.heading3") },
        h4: { label: t("articles.editor.heading4") },
        h5: { label: t("articles.editor.heading5") },
        h6: { label: t("articles.editor.heading6") },
        quote: { label: t("articles.editor.quote") },
        divider: { label: t("articles.editor.divider") },
      },
      listGroup: {
        label: t("articles.editor.listGroup"),
        bulletList: { label: t("articles.editor.bulletList") },
        orderedList: { label: t("articles.editor.orderedList") },
        taskList: { label: t("articles.editor.taskList") },
      },
      advancedGroup: {
        label: t("articles.editor.advancedGroup"),
        image: null,
        codeBlock: { label: t("articles.editor.code") },
        table: { label: t("articles.editor.table") },
        math: null,
      },
    },
  };
}

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
  const { t } = useTranslation();

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
      featureConfigs: crepeFeatureConfigs(t, placeholder ?? ""),
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
    <div className={cn("article-editor", readonly && "pointer-events-none", className)}>
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
