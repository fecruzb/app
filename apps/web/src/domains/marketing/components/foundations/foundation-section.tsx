import { type ComponentType, type ReactNode } from "react";
import type { TFunction } from "i18next";
import {
  CheckIcon,
  CloudIcon,
  FolderTreeIcon,
  RocketIcon,
  SlidersIcon,
  TerminalIcon,
} from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { EnvMock, TerminalMock, RenderMock } from "../product-preview";

export type Foundation = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  /** The evidence for this pillar: a schema map, a terminal, a Render panel. */
  visual: ReactNode;
};

const repoTreeFile = `app-base/
├── apps/
│   ├── api/          Hono + Drizzle + Postgres
│   └── web/          React + Vite SPA
├── packages/
│   ├── shared/       Zod schemas + DTOs (both sides)
│   └── ui/           @app/ui — shells, themes, base components
├── .cursor/rules/    conventions the AI follows
├── render.yaml       one-service deploy
└── turbo.json        task graph`;

const mediaStoreFile = `// lib/media-store.ts — the one interface any domain touches for files
export interface MediaStore {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  has(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

// domains/images/media.ts — the backend is picked once, at boot
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

function pillarCopy(key: "monorepo" | "config" | "storage" | "localRun" | "render", t: TFunction) {
  return {
    eyebrow: t(`landing.${key}.eyebrow`),
    title: t(`landing.${key}.title`),
    body: t(`landing.${key}.body`),
    points: points(t, `landing.${key}.points`),
  };
}

export function buildMonorepoPillar(t: TFunction): Foundation {
  return {
    id: "monorepo",
    icon: FolderTreeIcon,
    ...pillarCopy("monorepo", t),
    visual: <CodeBlock filename="app-base" code={repoTreeFile} lang="text" />,
  };
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
    <section className="border-t px-4 py-16 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal min-w-0 ${flip ? "lg:order-2" : ""}`}>
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Icon className="size-4" /> {pillar.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {pillar.title}
          </h3>
          <p className="mt-4 text-pretty text-muted-foreground">{pillar.body}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {pillar.points.map((point) => (
              <li key={point} className="flex gap-2.5">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal reveal-delay min-w-0 ${flip ? "lg:order-1" : ""}`}>
          {pillar.visual}
        </div>
      </div>
    </section>
  );
}
