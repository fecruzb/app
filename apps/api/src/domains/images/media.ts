// Storage for uploaded images. Two backends, chosen by environment:
//
//   local (default) — writes under env.mediaDir (apps/web/public/ by default),
//     fine for dev where the filesystem persists across requests.
//
//   R2 (production) — Render's filesystem is ephemeral, so anything written
//     there goes to the Cloudflare bucket instead.
//
// Either way the database stores the same relative path
// ("<tenantId>/uploads/<uuid>.webp"). Requests for a path not in the build
// are redirected to R2 in app.ts, so switching backends never requires
// touching stored data.
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { env } from "@/lib/env";
import { compressImage, withCompressedExt } from "@/lib/image-compress";
import type { MediaStore } from "@/lib/media-store";
import { isR2Configured, R2_PUBLIC_BASE_URL, r2Store } from "@/integrations/r2";

/** Local media root; also the folder app.ts serves static files from. */
export const MEDIA_DIR = env.mediaDir;

// Created eagerly so app.ts always has a real folder to mount serveStatic on,
// even before the first local upload happens.
mkdirSync(MEDIA_DIR, { recursive: true });

const localStore: MediaStore = {
  async has(key) {
    return existsSync(join(MEDIA_DIR, key));
  },

  async put(key, data) {
    const dest = join(MEDIA_DIR, key);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, data);
  },

  async remove(key) {
    await unlink(join(MEDIA_DIR, key)).catch(() => {});
  },

  async get(key) {
    try {
      return await readFile(join(MEDIA_DIR, key));
    } catch {
      return null;
    }
  },
};

export const usingR2 = isR2Configured();
const backend: MediaStore = usingR2 ? r2Store : localStore;

export const mediaStore = backend;

/**
 * Prefixes a media key by tenant ("<tenantId>/uploads/x.webp"). Two tenants
 * can upload files with the same name — the prefix keeps one from
 * overwriting the other's object.
 */
export function tenantMediaKey(tenantId: string, key: string): string {
  return `${tenantId}/${key.replace(/^\/+/, "")}`;
}

/** A fresh key for a new upload, scoped to the tenant. */
export function newUploadKey(tenantId: string, ext: string): string {
  return tenantMediaKey(tenantId, `uploads/${randomUUID()}.${ext}`);
}

/**
 * Compresses and writes the image, returning its public path and the
 * compressed size (what's actually stored and served, not the upload size).
 *
 * Compression lives here, not in the caller, so no upload path can ever
 * store the raw bytes by accident.
 */
export async function writeMedia(
  key: string,
  data: Buffer,
): Promise<{ path: string; sizeBytes: number }> {
  const target = withCompressedExt(key);
  const compressed = await compressImage(data);
  await mediaStore.put(target, compressed);
  return { path: `/${target}`, sizeBytes: compressed.byteLength };
}

/** Deletes the stored image at the given public path (best-effort). */
export async function removeMedia(path: string): Promise<void> {
  await mediaStore.remove(path.replace(/^\/+/, ""));
}

/** URL of the image on R2, or null when R2 is off (served locally instead). */
export function mediaPublicUrl(path: string): string | null {
  if (!usingR2) return null;
  return `${R2_PUBLIC_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
