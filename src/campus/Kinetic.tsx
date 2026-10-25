import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import { finePointer, prefersReducedMotion } from '../lib/kinetic';
import { useMotion } from '../lib/prefs';
import type { Lang } from '../i18n';

/**
 * A heading whose words drop into place like cartons while Archivo settles from condensed and light
 * to its set width and weight. Latin letters also gain weight near the pointer; Hindi and Telugu
 * move by whole words only, so conjuncts are never split. Screen readers get the plain text.
 */
export function KineticTitle({ as: Tag = 'h1', id, lines, lang, play = 'mount', pointer = false }: {
  as?: 'h1' | 'h2'; id: string; lines: string[]; lang: Lang; play?: 'mount' | 'view'; pointer?: boolean;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const calm = useMotion() === 'calm';
  const latin = lang === 'en', letters = latin && pointer;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (calm || prefersReducedMotion()) { el.classList.add('is-in'); return; }
    if (play === 'mount') { const r = requestAnimationFrame(() => el.classList.add('is-in')); return () => cancelAnimationFrame(r); }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-in'); io.disconnect(); } }, { threshold: .35 });
    io.observe(el);
    return () => io.disconnect();
  }, [play, calm]);
  useEffect(() => {
    const el = ref.current;
    if (!el || !letters || calm || prefersReducedMotion() || !finePointer()) return;
    const chars = [...el.querySelectorAll<HTMLElement>('.k-ch')];
    const level = chars.map(() => 0);
    let centers: [number, number][] = [], measuredAt = NaN, px = -1e4, py = -1e4, raf = 0;
    const measure = () => { centers = chars.map(c => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }); measuredAt = scrollY; };
    const tick = () => {
      raf = 0;
      let moving = false;
      chars.forEach((c, i) => {
        const [cx, cy] = centers[i];
        const near = Math.max(0, 1 - Math.hypot(px - cx, (py - cy) * 1.4) / 170), goal = near * near * (3 - 2 * near);
        let v = level[i] + (goal - level[i]) * .2;
        if (Math.abs(goal - v) < .003) v = goal; else moving = true;
        if (v !== level[i]) { level[i] = v; c.style.setProperty('--p', v.toFixed(3)); }
      });
      if (moving) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || scrollY > innerHeight) return;
      if (measuredAt !== scrollY || !centers.length) measure();
      px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => { px = py = -1e4; if (!raf) raf = requestAnimationFrame(tick); };
    const stale = () => { centers = []; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('resize', stale);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', stale);
      chars.forEach(c => c.style.removeProperty('--p'));
    };
  }, [letters, calm, lines]);
  let count = 0;
  return <Tag ref={ref} id={id} className="k-title">
    {lines.map((line, n) => {
      const words = line.split(/\s+/).filter(Boolean);
      const node = <span key={n} className="k-line" aria-hidden="true">{words.map((word, i) => <Fragment key={i}>
        <span className="word"><span style={{ '--i': count + i } as CSSProperties}>{letters ? [...word].map((ch, j) => <span key={j} className="k-ch">{ch}</span>) : word}</span></span>
        {i < words.length - 1 ? ' ' : null}
      </Fragment>)}</span>;
      count += words.length;
      return node;
    })}
    <span className="sr-only">{lines.join(' ')}</span>
  </Tag>;
}

/** A scroll cue drawn as a short conveyor: a carton rides down the belt and drops off the end. */
export function ConveyorCue() {
  return <span className="conveyor" aria-hidden="true"><i className="conveyor-roller" /><i className="conveyor-carton" /><i className="conveyor-roller" /></span>;
}
