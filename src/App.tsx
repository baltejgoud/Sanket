import { lazy, startTransition, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LangContext, dict, type Lang } from "./i18n";
import { copy } from "./copy";
import { FieldStage } from "./field/FieldStage";
import { Header } from "./components/Header";
import { Cursor } from "./components/Cursor";
import { onIdle, ScrollTrigger, useReducedMotion, useSmoothScroll } from "./lib/motion";
import { palette } from "./lib/paletteBus";
import { Toaster } from "./components/Toast";
import { Dock } from "./components/Dock";
import { useMotion } from "./lib/prefs";
import { Hero } from "./chapters/Hero";
import { Signal } from "./chapters/Signal";
import { Problems } from "./chapters/Problems";
import { Forecast } from "./chapters/Forecast";
import { Decide } from "./chapters/Decide";
import { World } from "./chapters/World";
import { Proof } from "./chapters/Proof";
import { Invitation } from "./chapters/Invitation";

const loadPalette = () => import("./components/Palette");
const Palette = lazy(loadPalette);

const TRACKED = ["top", "signal", "problems", "forecast", "command", "decide", "industries", "integrations", "roi", "stories", "security", "contact"];

function readLang(): Lang {
  try {
    const saved = localStorage.getItem("sanket-lang");
    if (saved === "en" || saved === "hi" || saved === "te") return saved;
  } catch {
    // storage unavailable: fall back to English
  }
  return "en";
}

const posterMode = typeof location !== "undefined" && new URLSearchParams(location.search).has("poster");

export default function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [active, setActive] = useState("top");
  const reduced = useReducedMotion();
  const calm = useMotion() === "calm";
  const t = dict[lang];
  const c = copy[lang];
  const stageCopy = useMemo(() => ({ ...c.stage, inStock: c.rail[4], lang }), [c, lang]);
  useSmoothScroll(!reduced && !calm && !posterMode);
  // A language switch re-renders the whole story; as a transition React renders it in slices,
  // so the press paints at once instead of after the full re-render. The choice is stored right
  // away, so a reload straight after the press still keeps it.
  const switchLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem("sanket-lang", next);
    } catch {
      // storage unavailable: the choice just won't persist
    }
    startTransition(() => setLang(next));
  }, []);

  // ⌘K / Ctrl+K, or "/" outside text fields, opens the palette; focus goes back to the opener on Escape.
  const [paletteOpen, setPaletteOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const open = () => {
      opener.current = document.activeElement as HTMLElement | null;
      setPaletteOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as Element | null)?.closest?.("input, textarea, select, [contenteditable='true']");
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    const off = palette.onOpen(open);
    // Fetch the palette while idle so the first ⌘K opens at once.
    const cancel = onIdle(() => void loadPalette(), 4000);
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
      cancel();
    };
  }, []);
  const closePalette = useCallback((ran: boolean) => {
    setPaletteOpen(false);
    if (!ran) opener.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    // Line lengths change with the language; re-measure every trigger.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const triggers = TRACKED.map(id => {
      const el = document.getElementById(id);
      return el
        ? ScrollTrigger.create({
            trigger: el,
            start: "top 45%",
            end: "bottom 45%",
            onToggle: self => self.isActive && setActive(id),
          })
        : null;
    });
    return () => triggers.forEach(st => st?.kill());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("poster-mode", posterMode);
  }, []);

  return (
    <LangContext.Provider value={lang}>
      <a href="#main" className="skip-link">
        {t.skip}
      </a>
      <FieldStage copy={stageCopy} />
      <Header lang={lang} setLang={switchLang} active={active} />
      <Cursor fieldLabel={c.hero.cursor} />
      <main id="main" className={`lang-${lang}`}>
        <Hero lang={lang} />
        <Signal />
        <Problems />
        <Forecast />
        <Decide />
        <World />
        <Proof />
        <Invitation />
      </main>
      <Dock />
      <Suspense fallback={null}>{paletteOpen && <Palette lang={lang} setLang={switchLang} onClose={closePalette} />}</Suspense>
      <Toaster />
    </LangContext.Provider>
  );
}
