import { type ComponentType, type ReactNode } from "react";
import type { TFunction } from "i18next";
import {
  CloudIcon,
  LayoutIcon,
  PaletteIcon,
  RocketIcon,
  ServerIcon,
  SlidersIcon,
  TerminalIcon,
} from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { Explorer } from "@app/ui/explorer";
import { FeatureSplit } from "../feature-split";
import { EnvMock, TerminalMock, RenderMock } from "../product-preview";
import { buildApiTree, buildUiTree, buildWebTree } from "./explorer-trees";

export type Foundation = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** The evidence for this pillar: explorer zoom, schema map, terminal… */
  visual: ReactNode;
};

const mediaStoreFile = `// lib/media-store.ts — the one interface any domain touches for files
export interface MediaStore {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  has(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

// domains/article/media.ts — the backend is picked once, at boot
export const usingR2 = isR2Configured();
export const mediaStore: MediaStore = usingR2
  ? r2Store    // integrations/r2.ts — Cloudflare R2, public URL
  : localStore; // disk — dev only, Render's disk is ephemeral

export async function writeMedia(key: string, data: Buffer) {
  const target = withCompressedExt(key);
  const compressed = await compressImage(data); // sharp → WebP
  await mediaStore.put(target, compressed);
  return { path: \`/\${target}\`, sizeBytes: compressed.byteLength };
}`;

function pillarCopy(key: "config" | "storage" | "localRun" | "render", t: TFunction) {
  return {
    eyebrow: t(`landing.${key}.eyebrow`),
    title: t(`landing.${key}.title`),
    body: t(`landing.${key}.body`),
    points: points(t, `landing.${key}.points`),
  };
}

function moduleCopy(key: "api" | "web" | "ui", t: TFunction) {
  return {
    eyebrow: t(`landing.moduleZoom.${key}.eyebrow`),
    title: t(`landing.moduleZoom.${key}.title`),
    body: t(`landing.moduleZoom.${key}.body`),
    points: points(t, `landing.moduleZoom.${key}.points`),
  };
}

/** Zoom into api → web → ui after the hero shows the whole repo. */
export function buildModuleZooms(t: TFunction): Foundation[] {
  return [
    {
      id: "api",
      icon: ServerIcon,
      ...moduleCopy("api", t),
      visual: (
        <Explorer
          workspace={t("landing.moduleZoom.api.workspace")}
          ariaLabel={t("landing.moduleZoom.api.aria")}
          tree={buildApiTree(t)}
        />
      ),
    },
    {
      id: "web",
      icon: LayoutIcon,
      ...moduleCopy("web", t),
      visual: (
        <Explorer
          workspace={t("landing.moduleZoom.web.workspace")}
          ariaLabel={t("landing.moduleZoom.web.aria")}
          tree={buildWebTree(t)}
        />
      ),
    },
    {
      id: "ui",
      icon: PaletteIcon,
      ...moduleCopy("ui", t),
      visual: (
        <Explorer
          workspace={t("landing.moduleZoom.ui.workspace")}
          ariaLabel={t("landing.moduleZoom.ui.aria")}
          tree={buildUiTree(t)}
        />
      ),
    },
  ];
}

export function buildFoundations(t: TFunction): Foundation[] {
  return [
    {
      id: "config",
      icon: SlidersIcon,
      ...pillarCopy("config", t),
      visual: <EnvMock />,
    },
    {
      id: "storage",
      icon: CloudIcon,
      ...pillarCopy("storage", t),
      visual: <CodeBlock filename="lib/media-store.ts" code={mediaStoreFile} lang="ts" />,
    },
    {
      id: "localRun",
      icon: TerminalIcon,
      ...pillarCopy("localRun", t),
      visual: <TerminalMock />,
    },
  ];
}

export function buildRenderPillar(t: TFunction): Foundation {
  return {
    id: "render",
    icon: RocketIcon,
    ...pillarCopy("render", t),
    visual: <RenderMock />,
  };
}

/**
 * One foundation pillar: copy + bullets on one side, a faithful visual on the
 * other, alternating sides down the page. No sticky columns — both sides are
 * equal-weight and top-aligned so the rhythm reads as a single narrative.
 */
export function FoundationSection({ pillar, flip }: { pillar: Foundation; flip: boolean }) {
  const Icon = pillar.icon;
  return (
    <FeatureSplit
      bordered
      density="loose"
      flip={flip}
      eyebrow={
        <>
          <Icon className="size-4" />
          {pillar.eyebrow}
        </>
      }
      title={pillar.title}
      body={pillar.body}
      points={pillar.points}
      visual={pillar.visual}
    />
  );
}
