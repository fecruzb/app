import { useEffect, useState, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { WindowBar } from "@app/ui/browser-window";
import {
  AccountMock,
  AgentChatMock,
  flows,
  LoginMock,
  McpKeysMock,
  ShellMock,
  type Screen,
} from "../product-preview";

type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  /** A single static mock… */
  mock?: ComponentType;
  /** …or a multi-screen flow that keeps the browser chrome fixed and swaps the body. */
  flow?: Screen[];
};

function chapterCopy(
  key:
    | "signIn"
    | "signUp"
    | "recovery"
    | "shell"
    | "agent"
    | "account"
    | "team"
    | "admin"
    | "plans"
    | "mcp",
  t: TFunction,
) {
  return {
    eyebrow: t(`landing.chapters.${key}.eyebrow`),
    title: t(`landing.chapters.${key}.title`),
    body: t(`landing.chapters.${key}.body`),
  };
}

// The product tour as a flow: land, sign up, recover, then step into the
// workspace and each thing it ships with. Emails hang off the flow that sends
// them rather than standing alone.
export function buildChapters(t: TFunction): Chapter[] {
  return [
    { id: "signIn", ...chapterCopy("signIn", t), mock: LoginMock },
    { id: "signUp", ...chapterCopy("signUp", t), flow: flows.register },
    { id: "recovery", ...chapterCopy("recovery", t), flow: flows.recovery },
    { id: "shell", ...chapterCopy("shell", t), mock: ShellMock },
    { id: "agent", ...chapterCopy("agent", t), mock: AgentChatMock },
    { id: "account", ...chapterCopy("account", t), mock: AccountMock },
    { id: "team", ...chapterCopy("team", t), flow: flows.invite },
    { id: "admin", ...chapterCopy("admin", t), flow: flows.admin },
    { id: "plans", ...chapterCopy("plans", t), flow: flows.plans },
    { id: "mcp", ...chapterCopy("mcp", t), mock: McpKeysMock },
  ];
}

/** One product-tour chapter: copy on one side, its mock (plus any email) on the other. */
export function ChapterSection({ chapter, flip }: { chapter: Chapter; flip: boolean }) {
  return (
    <section className="px-4 py-10 sm:py-12">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`reveal ${flip ? "lg:order-2" : ""}`}>
          <p className="text-sm font-medium text-primary">{chapter.eyebrow}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {chapter.title}
          </h3>
          <p className="mt-4 text-pretty text-muted-foreground">{chapter.body}</p>
        </div>
        <div className={`reveal reveal-delay min-w-0 ${flip ? "lg:order-1" : ""}`}>
          <MockCarousel chapter={chapter} />
        </div>
      </div>
    </section>
  );
}

/**
 * A single-mock chapter renders its mock as-is. A flow chapter keeps the browser
 * chrome (frame + bar) fixed and only crossfades the body inside on a timer, so
 * alternating between screens never resizes the frame or jumps the layout.
 */
function MockCarousel({ chapter }: { chapter: Chapter }) {
  const { t } = useTranslation();
  const screens = chapter.flow;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!screens || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % screens.length), 3500);
    return () => clearInterval(id);
  }, [screens, paused]);

  if (!screens) {
    const Only = chapter.mock!;
    return <Only />;
  }

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <WindowBar
          label={
            screens[index].label === "inbox"
              ? t("landing.preview.window.inbox")
              : screens[index].label
          }
        />
        {/* Bodies share one grid cell: the tallest sets a fixed height, they crossfade in place. */}
        <div className="grid w-full grid-cols-1">
          {screens.map((screen, i) => {
            const Body = screen.Body;
            return (
              <div
                key={i}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 min-w-0 transition-opacity duration-500 ${
                  i === index ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <Body />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {screens.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={t("landing.showScreen", { n: i + 1 })}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
