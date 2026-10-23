import { useEffect, useRef, useState } from "react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { fieldStore } from "../field/store";
import { ScrollTrigger, onIdle, useReveal } from "../lib/motion";
import { OdometerPhrase } from "../components/Odometer";

/** Text steps inside the 0..1 scrub; the field's decision windows overlap these. */
const STEPS: [number, number][] = [
  [0, 0.27],
  [0.27, 0.53],
  [0.53, 0.78],
  [0.78, 1],
];

/** The verbs' weight and width move in this many steps. Every distinct value is a new Archivo
 *  instance, and building one costs a full text layout (about 15-20 ms on a laptop, several times
 *  that on a phone); a repeated value is cached and costs well under 1 ms. A device that takes
 *  longer than SLOW_BUILD_MS to build one gets the coarser VERB_STEPS_SLOW. */
const VERB_STEPS = 40;
const VERB_STEPS_SLOW = 12;
const SLOW_BUILD_MS = 40;

export function Decide() {
  const t = useT();
  const c = useCopy();
  const section = useReveal<HTMLElement>(0.05);
  const verbs = useRef<HTMLDivElement>(null);
  const steps = useRef<HTMLOListElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const verbSteps = useRef(VERB_STEPS);
  useFieldScene(section, { shot: "decide", signal: 0, forecast: 1, level: 0, focus: -1 });

  useEffect(() => {
    const el = section.current;
    const verbBox = verbs.current;
    const stepList = steps.current;
    if (!el || !verbBox || !stepList) return;
    const last: Record<string, string> = {};
    const set = (node: HTMLElement, name: string, value: string) => {
      if (last[name] === value) return;
      last[name] = value;
      node.style.setProperty(name, value);
    };
    const apply = (p: number) => {
      fieldStore.setDecide(p);
      const s = STEPS.findIndex(([a, b]) => p >= a && p < b);
      const index = s < 0 ? 3 : s;
      const [a, b] = STEPS[index];
      // Set each variable on the smallest subtree that reads it: a change to an inherited
      // custom property restyles every descendant, and this runs on every scroll frame.
      const vp = Math.min(1, Math.max(0, (p - a) / (b - a)));
      const n = verbSteps.current;
      set(verbBox, "--vp", (Math.round(vp * n) / n).toFixed(3));
      STEPS.forEach(([sa, sb], n) => set(stepList, `--s${n}`, Math.min(1, Math.max(0, (p - sa) / (sb - sa))).toFixed(3)));
      if (index !== stepRef.current) {
        // Adapt: demand moves again, and the balanced field absorbs it.
        if (index === 3 && stepRef.current < 3) fieldStore.pulse(0.08, 0.5, 1);
        stepRef.current = index;
        setStep(index);
      }
    };
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => apply(self.progress),
      onRefresh: self => apply(self.progress),
    });
    apply(st.progress);
    return () => st.kill();
  }, [section]);

  // Build every verb instance ahead of the scrub, one per idle slice, so the scrub itself only
  // hits the font cache. Start once the reader leaves the hero (Decide is chapters away), or
  // when Decide comes within two screens, e.g. after a jump from the index.
  const words = c.decide.verbs.map(v => v.verb).join(" ");
  useEffect(() => {
    const el = section.current;
    const box = verbs.current;
    if (!el || !box) return;
    let stop = () => {};
    let probe: HTMLElement | null = null;
    const begin = () => {
      if (probe) return;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      const node = (probe = document.createElement("p"));
      node.className = "verb display verb-probe";
      node.textContent = words;
      box.appendChild(node);
      let k = 0;
      const step = () => {
        const t0 = performance.now();
        node.style.setProperty("--vp", (k / verbSteps.current).toFixed(3));
        void node.offsetWidth;
        // The second build shows what this device pays per instance (the first includes setup).
        if (k === 1 && performance.now() - t0 > SLOW_BUILD_MS) {
          verbSteps.current = VERB_STEPS_SLOW;
          k = 0;
        }
        if (++k <= verbSteps.current) stop = onIdle(step, 300);
        else node.remove();
      };
      stop = onIdle(step, 300);
    };
    const onScroll = () => window.scrollY > window.innerHeight && begin();
    const io = new IntersectionObserver(entries => entries.some(e => e.isIntersecting) && begin(), { rootMargin: "200% 0px" });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      stop();
      probe?.remove();
    };
  }, [section, words]);

  return (
    <section ref={section} id="decide" className="chapter decide" data-field="show" aria-labelledby="decide-title">
      <span id="platform" className="alias" />
      <div className="decide-sticky">
        <div className="wrap decide-grid">
          <header className="decide-head">
            <p className="plate mono rule-in">
              <b>03</b> {c.decide.plate}
            </p>
            <h2 id="decide-title" className="decide-title display">
              {t.platform.title}
            </h2>
            <p className="muted">{t.platform.desc}</p>
          </header>

          <div ref={verbs} className="verbs" aria-hidden="true">
            {c.decide.verbs.map((v, i) => (
              <p key={i} className={`verb display ${i === step ? "is-active" : ""} ${i < step ? "is-past" : ""}`}>
                {v.verb}
              </p>
            ))}
          </div>

          <ol ref={steps} className="decide-steps">
            {c.decide.verbs.map((v, i) => (
              <li key={i} className={i === step ? "is-active" : ""} aria-current={i === step ? "step" : undefined}>
                <span className="mono">
                  0{i + 1}
                  <span className="step-word"> · {c.decide.step}</span>
                </span>
                <h3>{v.name}</h3>
                <i className="step-bar" style={{ ["--k" as string]: `var(--s${i})` }} aria-hidden="true" />
              </li>
            ))}
          </ol>

          <div className="decision-card">
            {c.decide.verbs.map((v, i) => (
              <div key={i} className={`decision-body ${i === step ? "is-active" : ""}`}>
                <p className="decision-desc">{v.desc}</p>
                <p className="decision-result display">
                  <OdometerPhrase text={v.result} variant="board" active={i === step} />
                </p>
                <p className="mono muted">{v.detail}</p>
              </div>
            ))}
            <p className="mono decision-flag">
              <i aria-hidden="true" />
              {c.decide.sandboxLabel}
            </p>
          </div>
          <p className="decide-control">{c.decide.control}</p>
        </div>
      </div>
    </section>
  );
}
