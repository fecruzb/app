import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

let instance: Promise<HighlighterCore> | null = null;

/**
 * Lazy singleton: TS + JSON, JS regex engine (no WASM), light + dark themes
 * so CodeBlock can swap on `html.dark` without reloading grammars.
 */
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
