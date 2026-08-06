import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const webRoot = path.resolve(import.meta.dirname, "../web");
const host = process.env.TAURI_DEV_HOST;

/**
 * Builds the shared `apps/web` SPA for the Tauri shell.
 * Env files (`VITE_API_URL`, `VITE_ROUTER`) load from this package directory.
 */
export default defineConfig({
  root: webRoot,
  envDir: import.meta.dirname,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(webRoot, "src"),
    },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
});
