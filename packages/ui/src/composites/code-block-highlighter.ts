import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/** Dual themes — Shiki emits both; the host app swaps to dark under `.dark`. */
export const CODE_THEMES = { light: "github-light", dark: "github-dark" } as const;

let instance: Promise<HighlighterCore> | null = null;

/** Lazy singleton: TS + JSON only, JS regex engine (no WASM), light + dark. */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!instance) {
    instance = createHighlighterCore({
      langs: [import("@shikijs/langs/typescript"), import("@shikijs/langs/json")],
      themes: [import("@shikijs/themes/github-light"), import("@shikijs/themes/github-dark")],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return instance;
}
