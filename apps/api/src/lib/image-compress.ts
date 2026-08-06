// Every upload is converted to WebP before it's stored: cheaper bucket, smaller
// bytes served to the browser, one consistent format regardless of what came in.
import sharp, { type WebpOptions } from "sharp";

export const COMPRESSED_EXT = "webp";

const WEBP_OPTIONS: WebpOptions = {
  quality: 90,
  alphaQuality: 100,
  effort: 4,
};

/** `unlimited` because libvips otherwise refuses very large source images. */
export async function compressImage(data: Buffer): Promise<Buffer> {
  return sharp(data, { unlimited: true }).webp(WEBP_OPTIONS).toBuffer();
}

/** Swaps the extension of a key/path for .webp ("a/b.png" -> "a/b.webp"). */
export function withCompressedExt(key: string): string {
  return key.replace(/\.[^./]+$/, "") + `.${COMPRESSED_EXT}`;
}
