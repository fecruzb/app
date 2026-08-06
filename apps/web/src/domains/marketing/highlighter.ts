import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export const CODE_THEME = "github-light";

let instance: Promise<HighlighterCore> | null = null;

/** Lazy singleton: TS + JSON only, JS regex engine (no WASM), one light theme. */
export function getHighlighter(): Promise<HighlighterCore> {
  if (!instance) {
    instance = createHighlighterCore({
      langs: [import("@shikijs/langs/typescript"), import("@shikijs/langs/json")],
      themes: [import("@shikijs/themes/github-light")],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return instance;
}
