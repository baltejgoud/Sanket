import { Fragment, useEffect, useRef } from "react";
import { ArrowDownRight, Box } from "lucide-react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { prefersReducedMotion, useMagnetic } from "../lib/motion";
import { useContactLinks } from "../lib/contact";
import { explore } from "../lib/paletteBus";
import { useField } from "../field/bridge";
import { WhatsAppIcon } from "../components/Icons";
import { Words } from "../components/Words";

/** Latin display lines split to characters; each character can rise like a column. */
function Chars({ text, start = 0 }: { text: string; start?: number }) {
  let i = start;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, w, all) => (
          <Fragment key={w}>
            <span className="w">
              {[...word].map((ch, n) => (
                <span className="c" key={n} style={{ ["--i" as string]: i++ }}>
                  <span className="r">{ch}</span>
                </span>
              ))}
            </span>
            {w < all.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </>
  );
}

/** Characters near the pointer rise, as stock rises where demand pulls. Transform only: no layout shift. */
function useRise(ref: React.RefObject<HTMLElement>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || prefersReducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".r"));
    let boxes: { x: number; y: number }[] = [];
    const measure = () => {
      boxes = chars.map(c => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
    };
    let raf = 0;
    let px = -9999;
    let py = -9999;
    const paint = () => {
      raf = 0;
      // A scroll or resize clears the boxes; pointerleave can then paint before the next move.
      if (!boxes.length) measure();
      chars.forEach((c, n) => {
        const b = boxes[n];
        const d2 = (b.x - px) ** 2 / (110 * 110) + (b.y - py) ** 2 / (180 * 180);
        const k = Math.exp(-d2);
        c.style.transform = k > 0.01 ? `scaleY(${(1 + 0.22 * k).toFixed(3)})` : "";
        c.style.color = k > 0.35 ? "var(--signal)" : "";
      });
    };
    const move = (e: PointerEvent) => {
      if (!boxes.length) measure();
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => {
      px = py = -9999;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const reset = () => (boxes = []);
    const host = el.closest("section")!;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", reset, { passive: true });
    window.addEventListener("resize", reset);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", reset);
      window.removeEventListener("resize", reset);
    };
  }, [ref, enabled]);
}

export function Hero({ lang }: { lang: string }) {
  const t = useT();
  const c = useCopy();
  const section = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const cta = useMagnetic<HTMLAnchorElement>(0.2);
  const links = useContactLinks();
  const field = useField();
  const latin = lang === "en";
  useFieldScene(section, { shot: "hero", signal: 0, forecast: 0, level: 0, focus: -1 });
  useRise(title, latin);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    // Reveal on the next frame so the transition runs; settle unclips the masks afterwards.
    const a = requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));
    const b = window.setTimeout(() => el.classList.add("is-settled"), prefersReducedMotion() ? 0 : 2200);
    return () => {
      cancelAnimationFrame(a);
      clearTimeout(b);
    };
  }, [lang]);

  return (
    <section ref={section} id="top" className="chapter hero" data-field="show" aria-labelledby="hero-title">
      <span id="intelligence" className="alias" />
      <div className="hero-zone" data-field-zone aria-hidden="true" />
      <div className="hero-veil" aria-hidden="true" />
      <div className="wrap hero-inner">
        <p className="dict fade" style={{ ["--d" as string]: "120ms" }}>
          <span className="dict-word" lang="hi">
            संकेत
          </span>
          <span className="dict-say mono">/saŋ·ket/</span>
          <span className="dict-pos serif">{c.hero.pos}</span>
          <span className="dict-gloss">{c.hero.gloss}</span>
        </p>
        <h1 ref={title} id="hero-title" className={`hero-title display ${latin ? "is-latin" : ""}`}>
          <span className="line line-full">{latin ? <Chars text={t.hero.h1a} /> : <Words text={t.hero.h1a} />}</span>
          <span className="line line-empty">{latin ? <Chars text={t.hero.h1b} start={18} /> : <Words text={t.hero.h1b} start={4} />}</span>
        </h1>
        <div className="hero-foot">
          <p className="lead fade" style={{ ["--d" as string]: "700ms" }}>
            {t.hero.desc}
          </p>
          <div className="hero-ctas fade" style={{ ["--d" as string]: "850ms" }}>
            <a ref={cta} className="btn btn-primary" href="#forecast">
              {c.hero.see}
              <span className="btn-icon">
                <ArrowDownRight size={20} />
              </span>
            </a>
            <a className="btn btn-ghost" href={links.wa} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} />
              {c.hero.talk}
            </a>
            {/* Always laid out, shown once the field runs, so its arrival moves nothing. */}
            <button className="btn btn-text hero-explore" data-ready={!!field} disabled={!field} onClick={() => explore.open()}>
              <Box size={17} aria-hidden="true" />
              {c.hero.explore}
            </button>
          </div>
          <p className="hero-meta mono fade" style={{ ["--d" as string]: "1000ms" }}>
            <span>{t.hero.pill}</span>
            <span>{t.hero.proof}</span>
          </p>
        </div>
      </div>
      <a className="hero-scroll mono" href="#signal">
        <i aria-hidden="true" />
        {c.hero.scroll}
      </a>
    </section>
  );
}
