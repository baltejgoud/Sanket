import { lazy, Suspense, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, X } from 'lucide-react';
import { LangContext, dict, type Lang } from './i18n';
import { Header } from './components/Header';
import { Toaster } from './components/Toast';
import { Cursor } from './components/Cursor';
import { palette, paletteInput, preloadPalette } from './lib/paletteBus';
import { track } from './lib/analytics';
import { finePointer, focusSection, useMagnetic } from './lib/kinetic';
import { StoryCards } from './campus/StoryCards';
import { CampusStage, LOAD_3D, dataSaver } from './campus/CampusStage';
import type { Facility } from './campus/timeline';
import { storyCopy as narrative } from './campus/storyCopy';
import { guideCopy } from './campus/guideCopy';
import { sceneCopy } from './campus/sceneCopy';
import { ConveyorCue, KineticTitle } from './campus/Kinetic';
import { Contact } from './campus/Contact';

const Palette = lazy(() => import('./components/Palette'));
const Sandbox = lazy(() => import('./chapters/Sandbox').then(m => ({ default: m.Sandbox })));
const ROI = lazy(() => import('./chapters/Proof').then(m => ({ default: () => <><m.ROI /><m.Stories /></> })));
const Integrations = lazy(() => import('./chapters/World').then(m => ({ default: () => <><m.Industries /><m.Integrations /></> })));
const isLang = (l: string | null): l is Lang => l === 'en' || l === 'hi' || l === 'te';
/** A shared link (?lang=hi) wins over the visitor's remembered choice. */
function readLang(): Lang {
  const linked = new URLSearchParams(location.search).get('lang');
  if (isLang(linked)) return linked;
  try { const l = localStorage.getItem('sanket-lang'); return isLang(l) ? l : 'en'; } catch { return 'en'; }
}
/** The page's language lives in the URL too, so a Hindi or Telugu page can be shared as it is. */
function writeLang(l: Lang) {
  const url = new URL(location.href);
  if (l === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', l);
  if (url.href !== location.href) history.replaceState(history.state, '', url);
}
// Search results and shared cards read the title and description; index.html carries the English ones.
const META = { title: document.title, description: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '' };

function Journey({ lang, openTool }: { lang: Lang; openTool: (t: number) => void }) {
  const n = narrative[lang], guide = guideCopy[lang], scene = sceneCopy[lang], fine = finePointer();
  const begin = useMagnetic<HTMLAnchorElement>(.25);
  const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
  const heading = (id: string, lines: string[]) => <h2 id={id}>{lines[0]}{' '}<span>{lines[1]}</span></h2>;
  const eyebrow = (i: number) => <p className="story-eyebrow"><b>0{i + 1}</b>{n.chapters[i]}</p>;
  return <main id="main" className={`campus-story lang-${lang}`}>
    <div id="top" />
    <section id="signal" className="story-section opening" aria-labelledby="hero-title">
      <div className="story-sticky"><div className="story-copy hero-copy">
        <p className="story-eyebrow"><span /><span className="k-type" style={{ '--n': `SANKET / ${n.audience}`.length } as CSSProperties}>SANKET / {n.audience}</span></p>
        <KineticTitle id="hero-title" lines={n.intro} lang={lang} pointer />
        <p className="story-lead k-rise" style={delay(520)}>{n.introBody}</p>
        <div className="hero-paths k-rise" style={delay(660)}><a ref={begin} className="story-begin" href="#warehouse">{n.begin}<ArrowDown size={18} aria-hidden="true" /></a><a className="hero-shortcut" href="#forecast">{guide.skip}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
        <p className="story-controls-hint k-rise" style={delay(820)}><ConveyorCue />{scene.hint}{fine && <span className="hint-lens"> · {scene.lens}</span>}</p>
        <p className="story-fallback-note" role="status">{dataSaver() ? <>{guide.saver} <button className="load-3d" onClick={() => window.dispatchEvent(new Event(LOAD_3D))}>{guide.saverLoad}</button></> : guide.fallback}</p>
      </div></div>
    </section>
    <section id="warehouse" className="story-section warehouse-section" aria-labelledby="warehouse-title">
      <div className="story-sticky"><div className="story-copy">{eyebrow(1)}{heading('warehouse-title', n.warehouse)}<p className="story-lead">{n.warehouseBody}</p></div><StoryCards chapter="warehouse" lang={lang} /></div>
    </section>
    <section id="problems" className="story-section problem-section" aria-labelledby="problem-title">
      <div className="story-sticky"><div className="story-copy">{eyebrow(2)}{heading('problem-title', n.problem)}<p className="story-lead">{n.problemBody}</p></div>
        <StoryCards chapter="problems" lang={lang} openTool={openTool} />
      </div>
    </section>
    <section id="forecast" className="story-section solution-section" aria-labelledby="forecast-title">
      <div className="story-sticky"><div className="story-copy">{eyebrow(3)}{heading('forecast-title', n.solution)}<p className="story-lead">{n.solutionBody}</p></div>
        <StoryCards chapter="forecast" lang={lang} openTool={openTool} />
      </div>
    </section>
    <section id="decide" className="story-section decision-section" aria-labelledby="decide-title">
      <div id="industries" className="anchor-alias" /><div id="proof" className="anchor-alias" /><div id="roi" className="anchor-alias" />
      <div className="story-sticky"><div className="story-copy">{eyebrow(4)}{heading('decide-title', n.how)}<p className="story-lead">{n.howBody}</p></div>
        <StoryCards chapter="decide" lang={lang} />
      </div>
    </section>
    <Contact lang={lang} openTool={openTool} />
  </main>;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(readLang);
  const [active, setActive] = useState('signal');
  const [selected, setSelected] = useState<Facility>('warehouse');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [tool, setTool] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const changeLang = useCallback((l: Lang) => { setLang(l); writeLang(l); try { localStorage.setItem('sanket-lang', l); } catch {} }, []);
  const onChapter = useCallback((id: string) => { setActive(id); track('chapter_reached', { chapter: id }, `chapter:${id}`); }, []);
  const openTool = useCallback((t: number) => { opener.current = document.activeElement as HTMLElement; setTool(t); track('tool_opened', { tool: ['forecast', 'business_case', 'connections'][t] }); }, []);
  const closeTool = () => { setTool(null); opener.current?.focus({ preventScroll: true }); };
  useEffect(() => {
    document.documentElement.lang = lang;
    const n = narrative[lang];
    document.title = lang === 'en' ? META.title : `SANKET — ${n.intro.join(' ')}`;
    document.querySelector('meta[name=description]')?.setAttribute('content', lang === 'en' ? META.description : `${n.introBody} ${n.audience}.`);
    // Each language version is its own canonical page (the hreflang set in index.html lists all three).
    const canonical = document.querySelector<HTMLLinkElement>('link[rel=canonical]');
    if (canonical) {
      const url = new URL(canonical.href);
      if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
      canonical.href = url.href;
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url.href);
    }
  }, [lang]);
  useEffect(() => {
    // In-page links move focus to where they land (the section's heading), not only the scroll position.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = decodeURIComponent(a.hash.slice(1));
      if (id) requestAnimationFrame(() => focusSection(id));
    };
    document.addEventListener('click', onClick);
    // The palette's chunk is fetched once the page is idle, so its first keystrokes are never slow.
    const prefetch = () => ('requestIdleCallback' in window ? requestIdleCallback(() => void preloadPalette(), { timeout: 4000 }) : setTimeout(preloadPalette, 3000));
    if (document.readyState === 'complete') prefetch(); else window.addEventListener('load', prefetch, { once: true });
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('load', prefetch); };
  }, []);
  useEffect(() => { if (tool !== null) dialog.current?.showModal(); else dialog.current?.close(); }, [tool]);
  useEffect(() => {
    const open = () => { opener.current = document.activeElement as HTMLElement; paletteInput.start(); setPaletteOpen(true); };
    const off = palette.onOpen(open);
    const key = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); open(); } };
    const toolEvent = (e: Event) => openTool((e as CustomEvent<number>).detail);
    window.addEventListener('keydown', key); window.addEventListener('sanket:tool', toolEvent);
    return () => { off(); window.removeEventListener('keydown', key); window.removeEventListener('sanket:tool', toolEvent); };
  }, [openTool]);
  return <LangContext.Provider value={lang}>
    <a className="skip-link" href="#main">{dict[lang].skip}</a>
    <CampusStage lang={lang} selected={selected} onSelect={setSelected} onChapter={onChapter} />
    <Header lang={lang} setLang={changeLang} active={active} />
    <Journey lang={lang} openTool={openTool} />
    <Suspense fallback={null}>{paletteOpen && <Palette lang={lang} setLang={changeLang} onClose={() => { setPaletteOpen(false); opener.current?.focus({ preventScroll: true }); }} />}</Suspense>
    <dialog ref={dialog} className="campus-tool-dialog" aria-labelledby="tool-title" onCancel={closeTool} onClose={() => { if (tool !== null) closeTool(); }}>
      <header><div><p className="mono">SANKET / {narrative[lang].example}</p><h2 id="tool-title">{tool !== null ? narrative[lang].tools[tool] : ''}</h2></div><button aria-label={narrative[lang].close} onClick={closeTool}><X size={24} /></button></header>
      <Suspense fallback={<p role="status">Loading…</p>}>{tool === 0 ? <Sandbox /> : tool === 1 ? <ROI /> : tool === 2 ? <Integrations /> : null}</Suspense>
    </dialog>
    <Toaster />
    <Cursor fieldLabel="" />
  </LangContext.Provider>;
}
