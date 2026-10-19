import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { dict, languages, type Lang } from "../i18n";
import { copy } from "../copy";
import { scrollToId, useMagnetic } from "../lib/motion";
import { Mark } from "./Icons";

export const CHAPTERS = [
  { id: "signal", key: "signal", n: "01" },
  { id: "forecast", key: "forecast", n: "02" },
  { id: "decide", key: "decide", n: "03" },
  { id: "industries", key: "world", n: "04" },
  { id: "roi", key: "proof", n: "05" },
] as const;

/** Which header link a section belongs to. */
const GROUP: Record<string, string> = {
  signal: "signal",
  problems: "signal",
  forecast: "forecast",
  command: "forecast",
  decide: "decide",
  industries: "industries",
  integrations: "industries",
  roi: "roi",
  stories: "roi",
  security: "roi",
};

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
    if (thenScrollTo) requestAnimationFrame(() => scrollToId(thenScrollTo));
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
              {c.nav[ch.key]}
            </a>
          ))}
        </nav>
        <div className="header-actions">
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
          {[...CHAPTERS.map(ch => ({ id: ch.id, n: ch.n, label: c.nav[ch.key] })), { id: "contact", n: "06", label: c.nav.talk }].map(item => (
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
          <LangSwitch lang={lang} setLang={setLang} label={t.langLabel} />
          <p>{t.footer.tagline}</p>
        </div>
      </dialog>

      <StateRail labels={c.rail} active={active} />
    </>
  );
}

function LangSwitch({ lang, setLang, label }: { lang: Lang; setLang: (l: Lang) => void; label: string }) {
  return (
    <div className="lang-switch" role="group" aria-label={label}>
      {languages.map(l => (
        <button key={l.code} lang={l.code} aria-label={l.name} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>
          {l.label}
        </button>
      ))}
    </div>
  );
}

/** Story position per section. Between "Decide" and "In stock" the visitor is checking the fit and the proof. */
const RAIL_INDEX: Record<string, number> = {
  top: 0,
  signal: 1,
  problems: 1,
  forecast: 2,
  command: 2,
  decide: 3,
  industries: 3.5,
  integrations: 3.5,
  roi: 3.5,
  stories: 3.5,
  security: 3.5,
  contact: 4,
};
const RAIL_TARGET = ["top", "signal", "forecast", "decide", "contact"];

/** Right-edge indicator: where the story (and the field) stands. Mouse convenience; the header nav is the accessible index. */
function StateRail({ labels, active }: { labels: string[]; active: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const index = RAIL_INDEX[active] ?? 0;
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={rail} className="state-rail" aria-hidden="true">
      <span className="rail-line">
        <i />
      </span>
      {labels.map((label, n) => (
        <div key={n} className={`rail-item ${n === index ? "is-active" : ""} ${n < index ? "is-past" : ""}`} onClick={() => scrollToId(RAIL_TARGET[n])}>
          <i />
          <span className="mono">{label}</span>
        </div>
      ))}
    </div>
  );
}
