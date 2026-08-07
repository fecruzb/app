/**
 * Article upload constants
 */

/** Allowed upload MIME types mapped to file extensions. */
export const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Maximum upload size (12 MB). */
export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
