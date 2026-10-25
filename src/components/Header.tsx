import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Pause, Play, Search, X } from "lucide-react";
import { dict, languages, type Lang } from "../i18n";
import { copy } from "../copy";
import { storyCopy } from "../campus/storyCopy";
import { focusSection, scrollToId, useMagnetic } from "../lib/kinetic";
import { prefs, useMotion } from "../lib/prefs";
import { palette, preloadPalette } from "../lib/paletteBus";
import { usePuck } from "../lib/detents";
import { Mark } from "./Icons";

export const CHAPTERS = [
  { id: "warehouse", n: "02", index: 1 },
  { id: "problems", n: "03", index: 2 },
  { id: "forecast", n: "04", index: 3 },
  { id: "decide", n: "05", index: 4 },
] as const;
const GROUP: Record<string, string> = { warehouse: 'warehouse', problems: 'problems', forecast: 'forecast', decide: 'decide' };

export function Header({ lang, setLang, active }: { lang: Lang; setLang: (l: Lang) => void; active: string }) {
  const c = copy[lang];
  const t = dict[lang];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const talk = useMagnetic<HTMLAnchorElement>(0.22);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const closeMenu = (thenScrollTo?: string) => {
    setOpen(false);
    if (thenScrollTo) requestAnimationFrame(() => { scrollToId(thenScrollTo); focusSection(thenScrollTo); });
    else opener.current?.focus();
  };

  const group = GROUP[active] ?? "";

  return (
    <>
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#top" className="brand" aria-label="SANKET — back to top">
          <Mark size={24} />
          <span className="brand-word">SANKET</span>
          <span className="brand-deva" lang="hi" aria-hidden="true">
            संकेत
          </span>
        </a>
        <nav className="chapter-nav" aria-label="Chapters">
          {CHAPTERS.map(ch => (
            <a key={ch.id} href={`#${ch.id}`} aria-current={group === ch.id ? "location" : undefined}>
              <span className="mono">{ch.n}</span>
              {storyCopy[lang].chapters[ch.index]}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <JumpButton label={c.nav.jump} />
          <MotionToggle label={c.nav.pause} />
          <LangSwitch lang={lang} setLang={setLang} label={t.langLabel} />
          <a ref={talk} className="talk" href="#contact">
            {c.nav.talk}
            <ArrowUpRight size={16} />
          </a>
          <button
            ref={opener}
            className="menu-button"
            aria-label={c.nav.menu}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="site-index"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <dialog ref={dialog} id="site-index" className="site-index" aria-label={c.nav.index} onCancel={() => closeMenu()} onClose={() => setOpen(false)}>
        <div className="index-top">
          <span className="mono">SANKET / {c.nav.index}</span>
          <button className="index-close" aria-label={c.nav.close} onClick={() => closeMenu()}>
            <X size={26} />
          </button>
        </div>
        <nav aria-label={c.nav.index}>
          {[...CHAPTERS.map(ch => ({ id: ch.id, n: ch.n, label: storyCopy[lang].chapters[ch.index] })), { id: "contact", n: "06", label: c.nav.talk }].map(item => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={e => {
                e.preventDefault();
                closeMenu(item.id);
              }}
            >
              <span className="mono">{item.n}</span>
              {item.label}
              <ArrowUpRight />
            </a>
          ))}
        </nav>
        <div className="index-foot">
          <div className="index-controls">
            <LangSwitch lang={lang} setLang={setLang} label={t.langLabel} />
            <MotionToggle label={c.nav.pause} />
          </div>
          <p>{t.footer.tagline}</p>
        </div>
      </dialog>

      <ReadingProgress />
    </>
  );
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Opens the ⌘K palette; the shortcut is shown, and declared for assistive tech. */
export function JumpButton({ label, className = "jump" }: { label: string; className?: string }) {
  return (
    <button className={className} aria-keyshortcuts="Meta+K Control+K" onClick={() => palette.open()} onPointerEnter={preloadPalette} onFocus={preloadPalette}>
      <Search size={15} aria-hidden="true" />
      <span className="jump-label">{label}</span>
      <kbd aria-hidden="true">{isMac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}

/** Pause, Stop, Hide (WCAG 2.2.2). The name stays "Pause motion"; aria-pressed says whether it is paused. */
function MotionToggle({ label }: { label: string }) {
  const calm = useMotion() === "calm";
  return (
    <button className="motion-toggle" aria-pressed={calm} title={label} onClick={() => prefs.setMotion(calm ? "full" : "calm")}>
      {calm ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function LangSwitch({ lang, setLang, label }: { lang: Lang; setLang: (l: Lang) => void; label: string }) {
  const puck = usePuck<HTMLDivElement>();
  return (
    <div ref={puck} className="lang-switch" role="group" aria-label={label}>
      {languages.map(l => (
        <button key={l.code} lang={l.code} aria-label={l.name} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

/** Each header chapter link's underline fills with reading progress through its chapter (--read). */
function ReadingProgress() {
  useEffect(() => {
    let raf = 0;
    const links = CHAPTERS.map(ch => ({
      el: document.querySelector<HTMLElement>(`.chapter-nav a[href="#${ch.id}"]`),
      ids: Object.keys(GROUP).filter(id => GROUP[id] === ch.id),
      from: 0,
      to: 1,
      last: -1,
    }));
    const measure = () => {
      for (const l of links) {
        const boxes = l.ids.map(id => document.getElementById(id)?.getBoundingClientRect()).filter(Boolean) as DOMRect[];
        if (!boxes.length) continue;
        l.from = Math.min(...boxes.map(b => b.top)) + window.scrollY;
        l.to = Math.max(...boxes.map(b => b.bottom)) + window.scrollY;
      }
    };
    const update = () => {
      raf = 0;
      const y = window.scrollY + window.innerHeight * 0.45;
      for (const l of links) {
        const read = Math.min(1, Math.max(0, (y - l.from) / Math.max(1, l.to - l.from)));
        if (!l.el || Math.abs(read - l.last) < 0.002) continue;
        l.last = read;
        l.el.style.setProperty("--read", read.toFixed(3));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const ro = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    ro.observe(document.body);
    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
