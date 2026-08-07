/**
 * Article media storage
 *
 * Two backends, chosen by environment:
 * - local (default) — writes under `env.mediaDir` (apps/web/public/ by default),
 *   fine for dev where the filesystem persists across requests.
 * - R2 (production) — Render's filesystem is ephemeral, so anything written
 *   there goes to the Cloudflare bucket instead.
 *
 * Either way the database stores the same relative path
 * (`<tenantId>/uploads/<uuid>.webp`). Requests for a path not in the build
 * are redirected to R2 in `app.ts`, so switching backends never requires
 * touching stored data.
 */
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

/**
 * Ensure the local media directory exists
 *
 * Call from server bootstrap — not at import time — so importing media helpers
 * in tests or tooling does not mkdir as a side effect.
 */
export function ensureMediaDir(): void {
  mkdirSync(MEDIA_DIR, { recursive: true });
}

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
 * Prefix a media key by tenant
 *
 * Produces `"<tenantId>/uploads/x.webp"`. Two tenants can upload files with
 * the same relative name — the prefix keeps one from overwriting the other.
 *
 * @param tenantId - Owning tenant
 * @param key - Relative key inside the tenant (leading slashes stripped)
 * @returns Tenant-scoped storage key
 */
export function tenantMediaKey(tenantId: string, key: string): string {
  return `${tenantId}/${key.replace(/^\/+/, "")}`;
}

/**
 * Allocate a fresh upload key
 *
 * @param tenantId - Owning tenant
 * @param ext - File extension without the dot (e.g. `webp`)
 * @returns Tenant-scoped key under `uploads/`
 */
export function newUploadKey(tenantId: string, ext: string): string {
  return tenantMediaKey(tenantId, `uploads/${randomUUID()}.${ext}`);
}

/**
 * Compress and write an image
 *
 * Returns the public path and the compressed size (what is stored and served,
 * not the upload size). Compression lives here so no upload path can store
 * the raw bytes by accident.
 *
 * @param key - Tenant-scoped storage key (extension may be normalized)
 * @param data - Raw uploaded bytes
 * @returns Public path (`/…`) and compressed size in bytes
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

/**
 * Delete a stored image
 *
 * Best-effort — missing keys are ignored.
 *
 * @param path - Public path or storage key (leading slashes stripped)
 */
export async function removeMedia(path: string): Promise<void> {
  await mediaStore.remove(path.replace(/^\/+/, ""));
}

/**
 * Public R2 URL for a media path
 *
 * @param path - Public path or storage key
 * @returns Absolute R2 URL, or null when R2 is off (local static serve)
 */
export function mediaPublicUrl(path: string): string | null {
  if (!usingR2) return null;
  return `${R2_PUBLIC_BASE_URL}/${path.replace(/^\/+/, "")}`;
}
