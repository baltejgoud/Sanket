import { useEffect, useState } from "react";
import { LangContext, dict, type Lang } from "./i18n";
import { copy } from "./copy";
import { FieldStage } from "./field/FieldStage";
import { Header } from "./components/Header";
import { Cursor } from "./components/Cursor";
import { ScrollTrigger, useReducedMotion, useSmoothScroll } from "./lib/motion";
import { Hero } from "./chapters/Hero";
import { Signal } from "./chapters/Signal";
import { Problems } from "./chapters/Problems";
import { Forecast } from "./chapters/Forecast";
import { Decide } from "./chapters/Decide";
import { World } from "./chapters/World";
import { Proof } from "./chapters/Proof";
import { Invitation } from "./chapters/Invitation";

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
  const t = dict[lang];
  const c = copy[lang];
  useSmoothScroll(!reduced && !posterMode);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("sanket-lang", lang);
    } catch {
      // storage unavailable: the choice just won't persist
    }
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
      <FieldStage copy={c.stage} />
      <Header lang={lang} setLang={setLang} active={active} />
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
    </LangContext.Provider>
  );
}
