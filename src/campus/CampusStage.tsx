import { useEffect, useRef, useState } from 'react';
import { CHAPTER_IDS, BEAT_COUNTS, storyBeat, documentProgress, sampleTimeline, type Facility } from './timeline';
import { useReducedMotion } from '../lib/kinetic';
import { useMotion } from '../lib/prefs';
import { storyCopy } from './storyCopy';
import { guideCopy } from './guideCopy';
import { ScenePanels } from './ScenePanels';
import { SCENE_HASH, sceneTop } from './StoryCards';
import type { Lang } from '../i18n';

/** Data saver (or prefers-reduced-data): the HTML story first; the 3D warehouse loads only when asked. */
export const dataSaver = () => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true || matchMedia('(prefers-reduced-data: reduce)').matches;
export const LOAD_3D = 'sanket:load-3d';

export function CampusStage({ lang, selected, onChapter }: { lang: Lang; selected: Facility; onSelect: (f: Facility) => void; onChapter: (id: string) => void }) {
  const n = storyCopy[lang];
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('loading');
  const initialAnchorHandled = useRef(false);
  useEffect(() => {
    if (status === 'loading' || initialAnchorHandled.current) return;
    initialAnchorHandled.current = true;
    const scene = location.hash.match(SCENE_HASH);
    const top = scene ? sceneTop(scene[1], Math.min(BEAT_COUNTS[scene[1]], Math.max(1, +scene[2])) - 1) : null;
    if (top !== null) scrollTo({ top, behavior: 'instant' });
    else document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, [status]);
  useEffect(() => {
    // A scene link followed on the page (or typed into the address bar) scrolls to that scene.
    const follow = () => {
      const scene = location.hash.match(SCENE_HASH);
      const top = scene && sceneTop(scene[1], Math.min(BEAT_COUNTS[scene[1]], Math.max(1, +scene[2])) - 1);
      if (top !== null && top !== undefined) scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    window.addEventListener('hashchange', follow);
    return () => window.removeEventListener('hashchange', follow);
  }, []);
  const reduced = useReducedMotion(), calm = useMotion() === 'calm';
  const options = useRef({ selected, reduced: reduced || calm }); options.current = { selected, reduced: reduced || calm };
  const refresh = useRef(() => {});
  useEffect(() => refresh.current(), [selected, reduced, calm, lang, status]);
  useEffect(() => {
    const forceFallback = import.meta.env.DEV && new URLSearchParams(location.search).has('no-webgl');
    let disposed = false;
    let engine: Awaited<ReturnType<typeof import('./engine').createCampus>> | undefined;
    let raf = 0;
    let positions: number[] = [];
    let active = '', address = location.hash;
    const beats = new Map<string, number>();
    // Scroll fires far more often than these values change; skip identical writes.
    const written = new Map<string, string>();
    const write = (el: HTMLElement | null | undefined, name: string, value: string) => {
      const key = `${el?.id}${name}`;
      if (!el || written.get(key) === value) return;
      written.set(key, value); el.style.setProperty(name, value);
    };
    const measure = () => { positions = CHAPTER_IDS.map(id => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + window.scrollY); update(); };
    const update = () => {
      cancelAnimationFrame(raf);
      const y = window.scrollY;
      const p = documentProgress(y, positions, innerHeight);
      engine?.update(p, options.current.reduced, options.current.selected);
      const chapter = CHAPTER_IDS[Math.min(5, Math.floor(p))];
      if (chapter !== active) { active = chapter; onChapter(chapter); }
      // Decision checklist shares exactly the same progress as the world.
      const state = sampleTimeline(p);
      const readingLayout = host.current?.classList.contains('campus-fallback') || matchMedia('(max-height: 520px)').matches;
      const step = state.step;
      write(host.current, '--hero', state.hero.toFixed(3));
      write(host.current, '--finale', state.finale.toFixed(3));
      host.current?.setAttribute('data-story-chapter', chapter);
      // From the contact section's top onward the scene sits under its dark backdrop as a still.
      engine?.setCovered(positions.length > 5 && y >= positions[5] - 1);
      document.querySelectorAll<HTMLElement>('[data-card-deck]').forEach(deck => {
        const id = deck.dataset.cardDeck!;
        const index = CHAPTER_IDS.indexOf(id as typeof CHAPTER_IDS[number]);
        const beat = storyBeat(p, index, BEAT_COUNTS[id]);
        // Cards enter from the direction of travel: up when reading on, down when going back.
        const previous = beats.get(id);
        if (previous !== undefined && previous !== beat) deck.dataset.dir = beat > previous ? 'next' : 'back';
        beats.set(id, beat);
        deck.querySelectorAll<HTMLElement>('[data-card-index]').forEach(card => {
          card.hidden = !readingLayout && Number(card.dataset.cardIndex) !== beat;
        });
        if (deck.contains(document.activeElement) && document.activeElement?.closest('[hidden]')) {
          const action = (document.activeElement as HTMLElement).dataset.sceneFocus ?? 'next';
          const visible = deck.querySelector<HTMLElement>('.story-detail-card:not([hidden])');
          const preferred = visible?.querySelector<HTMLButtonElement>(`[data-scene-focus="${action}"]:not(:disabled)`);
          (preferred ?? visible?.querySelector<HTMLElement>('[data-scene-focus="next"]'))?.focus({ preventScroll: true });
        }
        deck.style.setProperty('--beat-progress', String(Math.min(1, Math.max(0, (p - index) / .86))));
      });
      // Captions arrive only at the reading position, leaving the scene clear
      // while the next section travels up from below the viewport.
      if (!host.current?.classList.contains('campus-fallback')) {
        CHAPTER_IDS.forEach((id, i) => {
          const start = positions[i], end = positions[i + 1] ?? Infinity;
          const enter = Math.min(1, Math.max(0, (y - start + innerHeight * .12) / (innerHeight * .12)));
          const leave = Math.min(1, Math.max(0, (end - innerHeight * .75 - y) / (innerHeight * .25)));
          document.getElementById(id)?.style.setProperty('--caption-opacity', String(enter * leave));
        });
        // The opening's layers drift apart at different rates as it scrolls away.
        write(document.getElementById('signal'), '--hero-scroll', Math.min(1, Math.max(0, y / Math.max(1, positions[1] - innerHeight * .75))).toFixed(3));
      }
      // The address bar follows the reader (#problems/2), so any scene can be shared as it is on screen.
      // Replaced, never pushed: Back still leaves the page. Not before an incoming link has been honoured.
      if (initialAnchorHandled.current) {
        const hash = BEAT_COUNTS[chapter] ? `#${chapter}/${(beats.get(chapter) ?? 0) + 1}` : chapter === 'contact' ? '#contact' : '';
        if (hash !== address) { address = hash; history.replaceState(history.state, '', hash || location.pathname + location.search); }
      }
      document.querySelectorAll<HTMLElement>('[data-problem-step]').forEach(el => { el.dataset.active = String(Number(el.dataset.problemStep) === state.problemStep); });
      document.querySelectorAll<HTMLElement>('[data-story-step]').forEach(el => { el.dataset.active = String(Number(el.dataset.storyStep) === step); });
    };
    const queue = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    refresh.current = queue;
    const boot = () => import('./engine').then(async ({ createCampus }) => {
      if (disposed || !host.current) return;
      try {
        const created = await createCampus(host.current, () => setStatus('ready'), () => setStatus('fallback'));
        if (disposed) { created.dispose(); return; }
        engine = created; measure();
      } catch (error) { console.warn('Campus unavailable; HTML journey remains available.', error); setStatus('fallback'); }
    }).catch(() => setStatus('fallback'));
    // The engine chunk (three.js) waits for the page's own load and an idle moment, so it never
    // competes with the headline, fonts or first input. A stalled load event cannot hold it back.
    let started = false, idle = 0, timer = 0;
    const start = () => { if (started || disposed) return; started = true; boot(); };
    const whenIdle = () => { if ('requestIdleCallback' in window) idle = requestIdleCallback(start, { timeout: 800 }); else timer = setTimeout(start, 120) as unknown as number; };
    const saver = !forceFallback && dataSaver();
    const backstop = forceFallback || saver ? 0 : window.setTimeout(start, 2500);
    const asked = () => { setStatus('loading'); start(); };
    window.addEventListener(LOAD_3D, asked);
    if (forceFallback || saver) { setStatus('fallback'); measure(); }
    else if (document.readyState === 'complete') whenIdle();
    else window.addEventListener('load', whenIdle, { once: true });
    const resize = new ResizeObserver(() => { cancelAnimationFrame(raf); measure(); });
    resize.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', queue, { passive: true });
    return () => {
      disposed = true; refresh.current = () => {}; cancelAnimationFrame(raf); engine?.dispose(); resize.disconnect();
      clearTimeout(backstop); clearTimeout(timer); if (idle) cancelIdleCallback(idle);
      window.removeEventListener('load', whenIdle); window.removeEventListener(LOAD_3D, asked); window.removeEventListener('resize', measure); window.removeEventListener('scroll', queue);
    };
  }, [onChapter]);
  // A named group: the scene's live parts (loading status, data panels) stay reachable inside it.
  return <div ref={host} className={`campus-stage campus-${status}`} role="group" aria-label={n.stage}>
    <div className="campus-shade" />
    <div className="hero-shade" />
    <div className="finale-shade" />
    <div className="campus-load" role="status">{status === 'loading' ? guideCopy[lang].loading : ''}</div>
    <div className="campus-label" data-anchor="warehouse" aria-hidden="true"><span className="label-dot" />{n.labels[0]}<small>{n.labelNotes[0]}</small></div>
    <ScenePanels lang={lang} />
    <div className="campus-label" data-anchor="decision" aria-hidden="true"><span className="label-dot" />{n.labels[4]}<small>{n.labelNotes[4]}</small></div>
    <div className="campus-caption"><span>{n.example}</span><span>{n.scroll} ↓</span></div>
  </div>;
}
