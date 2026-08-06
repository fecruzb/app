// Backend-neutral storage contract. Both the R2 integration and the images
// domain depend on it, and neither may depend on the other.

/** Key = file path without the leading slash ("<tenantId>/uploads/x.webp"). */
export interface MediaStore {
  put(key: string, data: Buffer): Promise<void>;
  remove(key: string): Promise<void>;
  /** Does the file exist in this backend? Decides bucket vs local fallback. */
  has(key: string): Promise<boolean>;
  /** File bytes, or null if it doesn't exist. */
  get(key: string): Promise<Buffer | null>;
}
