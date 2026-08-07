import type { ComponentType } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FileCode2Icon,
  FileIcon,
  FileJsonIcon,
  FilesIcon,
  FolderIcon,
  FolderOpenIcon,
  GitBranchIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";
import { cn } from "../lib/utils";
import { ScaledContent } from "./content-scale";

export type ExplorerNode = {
  name: string;
  /** Stack / role annotation — sits like a VS Code decoration on the right. */
  hint?: string;
  kind: "folder" | "file";
  /** Highlight one row like the open editor in the explorer. */
  active?: boolean;
  children?: ExplorerNode[];
};

type ExplorerProps = {
  workspace: string;
  tree: ExplorerNode[];
  /** Panel header label — caller supplies i18n (no product copy in @app/ui). */
  title: string;
  ariaLabel: string;
  className?: string;
};

/**
 * VS Code / Cursor explorer chrome — activity bar + EXPLORER tree.
 * App-neutral frame for marketing demos and docs; pass any tree.
 *
 * Colors mimic the real editor chrome (same exception as browser-window traffic lights).
 */
function Explorer({ workspace, tree, title, ariaLabel, className }: ExplorerProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-md overflow-hidden rounded-lg border border-black/40 bg-[#1e1e1e] text-left text-[#cccccc] shadow-lg",
        className,
      )}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className="relative flex w-9 shrink-0 flex-col items-center gap-0 border-r border-white/10 bg-[#333333] py-1.5"
        aria-hidden
      >
        <ActivityIcon icon={FilesIcon} active />
        <ActivityIcon icon={SearchIcon} />
        <ActivityIcon icon={GitBranchIcon} />
        <ActivityIcon icon={SettingsIcon} className="mt-auto" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col bg-[#252526]">
        <div className="flex items-center justify-between px-2 pt-1.5 pb-0.5">
          <span className="text-[10px] font-semibold tracking-wider text-[#bbbbbb] uppercase">
            {title}
          </span>
          <span className="text-[9px] tracking-widest text-[#6b6b6b]">···</span>
        </div>

        <div className="flex w-full items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-[#bbbbbb] uppercase">
          <ChevronDownIcon className="size-3 shrink-0 opacity-70" aria-hidden />
          {workspace}
        </div>

        {/* Activity bar + EXPLORER header stay at 1× — only the tree zooms. */}
        <ScaledContent>
          <ul className="px-0.5 pb-1.5 font-mono text-[11px] leading-[18px]">
            {tree.map((node) => (
              <TreeRow key={node.name} node={node} depth={0} />
            ))}
          </ul>
        </ScaledContent>
      </div>
    </div>
  );
}

function ActivityIcon({
  icon: Icon,
  active,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative flex size-7 items-center justify-center",
        active ? "text-white" : "text-[#858585]",
        className,
      )}
    >
      {active ? (
        <span className="absolute top-1/2 left-0 h-3.5 w-0.5 -translate-y-1/2 rounded-r bg-white" />
      ) : null}
      <Icon className="size-3.5" />
    </span>
  );
}

function TreeRow({ node, depth }: { node: ExplorerNode; depth: number }) {
  const open = node.kind === "folder" && node.children !== undefined;
  const pad = 4 + depth * 10;

  return (
    <li>
      <div
        className={cn(
          "flex h-[18px] items-center gap-0.5 pr-1.5",
          node.active ? "bg-[#37373d] text-white" : "hover:bg-white/[0.04]",
        )}
        style={{ paddingLeft: pad }}
      >
        {node.kind === "folder" ? (
          open ? (
            <ChevronDownIcon className="size-3 shrink-0 opacity-60" aria-hidden />
          ) : (
            <ChevronRightIcon className="size-3 shrink-0 opacity-60" aria-hidden />
          )
        ) : (
          <span className="size-3 shrink-0" aria-hidden />
        )}
        <FileGlyph node={node} open={Boolean(open && node.children?.length)} />
        <span className="min-w-0 flex-1 truncate">{node.name}</span>
        {node.hint ? (
          <span className="hidden max-w-[50%] truncate text-[9px] text-[#6b6b6b] sm:inline">
            {node.hint}
          </span>
        ) : null}
      </div>
      {open && node.children && node.children.length > 0 ? (
        <ul>
          {node.children.map((child) => (
            <TreeRow key={`${node.name}/${child.name}`} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function FileGlyph({ node, open }: { node: ExplorerNode; open: boolean }) {
  if (node.kind === "folder") {
    const Icon = open ? FolderOpenIcon : FolderIcon;
    return <Icon className="size-3 shrink-0 text-[#dcb67a]" aria-hidden />;
  }
  if (node.name.endsWith(".json")) {
    return <FileJsonIcon className="size-3 shrink-0 text-[#cbcb41]" aria-hidden />;
  }
  if (
    node.name.endsWith(".yaml") ||
    node.name.endsWith(".yml") ||
    node.name.endsWith(".ts") ||
    node.name.endsWith(".tsx")
  ) {
    return <FileCode2Icon className="size-3 shrink-0 text-[#519aba]" aria-hidden />;
  }
  return <FileIcon className="size-3 shrink-0 text-[#6b6b6b]" aria-hidden />;
}

export { Explorer };
