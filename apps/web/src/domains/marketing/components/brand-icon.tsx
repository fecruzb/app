import {
  siDrizzle,
  siHono,
  siModelcontextprotocol,
  siNodedotjs,
  siOxc,
  siPostgresql,
  siPrettier,
  siReact,
  siReactquery,
  siShadcnui,
  siTailwindcss,
  siTurborepo,
  siTypescript,
  siVite,
  siZod,
  type SimpleIcon,
} from "simple-icons";
import { SparklesIcon } from "lucide-react";

/** Map a stack entry to its Simple Icons brand logo (or null when there's none). */
const brands: Record<string, SimpleIcon | null> = {
  "React 19": siReact,
  Vite: siVite,
  Tailwind: siTailwindcss,
  "shadcn/ui": siShadcnui,
  "TanStack Query": siReactquery,
  Hono: siHono,
  Zod: siZod,
  Node: siNodedotjs,
  PostgreSQL: siPostgresql,
  "Drizzle ORM": siDrizzle,
  OpenAI: null, // no brand logo in Simple Icons — falls back to a glyph
  "Model Context Protocol (MCP)": siModelcontextprotocol,
  TypeScript: siTypescript,
  Turborepo: siTurborepo,
  oxlint: siOxc,
  Prettier: siPrettier,
};

/**
 * Renders a technology's real brand logo from Simple Icons. Uses the brand's
 * official color, but stays legible in dark mode by lifting near-black logos to
 * the current text color. Unknown brands fall back to a neutral glyph.
 */
export function BrandIcon({ name, className }: { name: string; className?: string }) {
  const icon = brands[name];
  if (!icon) return <SparklesIcon className={className} />;

  // Near-black logos (shadcn/ui, MCP) would vanish on dark surfaces — let them
  // inherit the text color instead of forcing the brand hex.
  const isDark = parseInt(icon.hex, 16) < 0x333333;
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      className={className}
      fill={isDark ? "currentColor" : `#${icon.hex}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
}
