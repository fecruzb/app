/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute API origin for Tauri clients; empty = same-origin `/api`. */
  readonly VITE_API_URL?: string;
  /** `"hash"` for Tauri; omit for browser history routing. */
  readonly VITE_ROUTER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
