// R2 (Cloudflare) image storage backend — spoken through the S3 API, same
// client the other projects on this account use.
//
// The bucket is public via its "Public Development URL"; the server never
// proxies the bytes, only redirects to R2_PUBLIC_BASE_URL (see app.ts).
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "@/lib/env";
import type { MediaStore } from "@/lib/media-store";

const ENDPOINT = env.r2.endpoint;
const ACCESS_KEY_ID = env.r2.accessKeyId;
const SECRET_ACCESS_KEY = env.r2.secretAccessKey;
const BUCKET = env.r2.bucket;

/** Public origin of the bucket, no trailing slash. Empty = R2 disabled. */
export const R2_PUBLIC_BASE_URL = env.r2.publicBaseUrl;

/** R2 is only used once fully configured — without the public origin, images wouldn't open. */
export function isR2Configured(): boolean {
  return Boolean(ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY && R2_PUBLIC_BASE_URL);
}

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

function contentType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

let client: S3Client | undefined;

function s3(): S3Client {
  // "auto" is R2's region; the endpoint is what actually points at the account.
  client ??= new S3Client({
    region: "auto",
    endpoint: ENDPOINT ?? undefined,
    credentials: {
      accessKeyId: ACCESS_KEY_ID as string,
      secretAccessKey: SECRET_ACCESS_KEY as string,
    },
  });
  return client;
}

export const r2Store: MediaStore = {
  async has(key) {
    try {
      await s3().send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      return true;
    } catch {
      return false;
    }
  },

  async put(key, data) {
    await s3().send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: data,
        ContentType: contentType(key),
      }),
    );
  },

  async remove(key) {
    await s3().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  },

  async get(key) {
    try {
      const out = await s3().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
      const bytes = await out.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    } catch {
      return null;
    }
  },
};
