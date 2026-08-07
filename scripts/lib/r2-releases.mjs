/**
 * Shared helpers for desktop release publish scripts.
 * Uses the same R2 credentials/bucket as media (`CLOUDFLARE_*` / `R2_PUBLIC_BASE_URL`).
 * Artifacts live under the `desktop-releases/` prefix so they don't collide with images.
 */
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { brand } from "../../packages/shared/src/brand.ts";

/** Key prefix inside the shared media bucket. */
export const RELEASES_PREFIX = "desktop-releases";
export const MANIFEST_KEY = `${RELEASES_PREFIX}/latest/latest.json`;

export function loadEnvFiles(root) {
  for (const rel of ["apps/api/.env", ".env"]) {
    try {
      process.loadEnvFile(join(root, rel));
    } catch {
      // optional
    }
  }
}

export function requireEnv(name, value) {
  if (!value?.trim()) {
    console.error(`Missing ${name}`);
    process.exit(1);
  }
  return value.trim();
}

export function findNewestWithSuffix(dir, suffix) {
  if (!existsSync(dir)) return null;
  const matches = readdirSync(dir)
    .filter((name) => name.endsWith(suffix))
    .map((name) => join(dir, name))
    .filter((path) => statSync(path).isFile())
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return matches[0] ?? null;
}

export function readAppVersion(tauriConfPath) {
  return JSON.parse(readFileSync(tauriConfPath, "utf8")).version;
}

export function createR2Client() {
  const endpoint = requireEnv("CLOUDFLARE_S3_API", process.env.CLOUDFLARE_S3_API);
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: requireEnv("CLOUDFLARE_ACCESS_KEY_ID", process.env.CLOUDFLARE_ACCESS_KEY_ID),
      secretAccessKey: requireEnv(
        "CLOUDFLARE_SECRET_ACCESS_KEY",
        process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
      ),
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export function publicBase() {
  return requireEnv("R2_PUBLIC_BASE_URL", process.env.R2_PUBLIC_BASE_URL).replace(/\/$/, "");
}

export function releasesBucket() {
  return (process.env.CLOUDFLARE_MEDIA_BUCKET ?? "app").trim() || "app";
}

export async function putFile(client, bucket, { key, path, contentType, disposition }) {
  const sizeBytes = statSync(path).size;
  console.log("Uploading", path, "→", `s3://${bucket}/${key}`);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: createReadStream(path),
      ContentType: contentType,
      ContentLength: sizeBytes,
      CacheControl: "public, max-age=300",
      ContentDisposition: disposition,
    }),
  );
}

export async function putBody(client, bucket, { key, body, contentType }) {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=300",
    }),
  );
}

/** Fetch existing latest.json (or empty platforms) so every OS can merge safely. */
export async function fetchManifest(client, bucket) {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: MANIFEST_KEY }));
    const text = await res.Body.transformToString();
    return JSON.parse(text);
  } catch {
    return { version: "", pub_date: "", notes: "", platforms: {} };
  }
}

/**
 * Merge platform entries into latest.json and upload.
 * Always preserves other platforms (fixes the Symulous macOS overwrite race).
 */
export async function mergeAndPutManifest(client, bucket, { version, notes, platforms }) {
  const existing = await fetchManifest(client, bucket);
  const manifest = {
    version,
    pub_date: new Date().toISOString(),
    notes: notes ?? `${brand.displayName} ${version}`,
    platforms: { ...existing.platforms, ...platforms },
  };
  const body = `${JSON.stringify(manifest, null, 2)}\n`;
  console.log("→", `s3://${bucket}/${MANIFEST_KEY}`);
  await putBody(client, bucket, {
    key: MANIFEST_KEY,
    body,
    contentType: "application/json; charset=utf-8",
  });
  return manifest;
}
