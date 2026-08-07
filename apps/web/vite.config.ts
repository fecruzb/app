import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
// Vite config runs under Node ESM — use the file + `.ts` (not the `@app/shared` barrel).
import { brand } from "../../packages/shared/src/brand.ts";
import { defineConfig, type Plugin } from "vite";

/** Fills `%BRAND_*%` placeholders in index.html from `@app/shared` brand. */
function brandHtmlPlugin(): Plugin {
  const title = `${brand.displayName} — ${brand.tagline}`;
  return {
    name: "brand-html",
    transformIndexHtml(html) {
      return html.replaceAll("%BRAND_NAME%", brand.displayName).replaceAll("%BRAND_TITLE%", title);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), brandHtmlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://127.0.0.1:5050",
      "/media": "http://127.0.0.1:5050",
    },
  },
});
