import { type ComponentType, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { CloudIcon, RocketIcon, SlidersIcon, TerminalIcon } from "lucide-react";
import { points } from "@/i18n";
import { CodeBlock } from "@app/ui/code-block";
import { FeatureSplit } from "../feature-split";
import { EnvMock, TerminalMock } from "../product-preview";

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

// domains/article/utils/media.utils.ts — the backend is picked once, at boot
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

export function buildConfigPillar(t: TFunction): Foundation {
  return {
    id: "config",
    icon: SlidersIcon,
    ...pillarCopy("config", t),
    visual: <EnvMock />,
  };
}

export function buildLocalRunPillar(t: TFunction): Foundation {
  return {
    id: "localRun",
    icon: TerminalIcon,
    ...pillarCopy("localRun", t),
    visual: <TerminalMock />,
  };
}

export function buildStoragePillar(t: TFunction): Foundation {
  return {
    id: "storage",
    icon: CloudIcon,
    ...pillarCopy("storage", t),
    visual: <CodeBlock filename="lib/media-store.ts" code={mediaStoreFile} lang="ts" />,
  };
}

const renderYamlFile = `# render.yaml — one web service (API + SPA) + Postgres
services:
  - type: web
    name: app
    runtime: node
    buildCommand: npm ci --include=dev && npm run build
    startCommand: npm start
    preDeployCommand: npm run db:migrate
    healthCheckPath: /api/health
    autoDeploy: true
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: app-db
          property: connectionString
      - key: APP_URL
        sync: false          # set in the Render dashboard
      - key: RESEND_API_KEY
        sync: false
      - key: OPENAI_API_KEY
        sync: false

databases:
  - name: app-db
    plan: basic-256mb
    postgresMajorVersion: "16"`;

export function buildRenderPillar(t: TFunction): Foundation {
  return {
    id: "render",
    icon: RocketIcon,
    ...pillarCopy("render", t),
    visual: <CodeBlock filename="render.yaml" code={renderYamlFile} lang="text" />,
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
