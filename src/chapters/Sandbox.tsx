import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PackageCheck, RefreshCw, TrendingDown, TrendingUp, Zap } from "lucide-react";
import { useCopy } from "../copy";
import { prefersReducedMotion } from "../lib/motion";
import { visit } from "../lib/visit";
import { Odometer } from "../components/Odometer";

export interface Point {
  week: number;
  median: number;
  lo: number;
  hi: number;
  observed: number | null;
}

/** The sandbox's simulated forecast. Unchanged from the original product demo. */
export function series(scenario: number, horizon: number, offset: number, phase = 0): Point[] {
  return Array.from({ length: horizon }, (_, i) => {
    const p = i < 5 ? 0 : (i - 4) / (horizon - 4);
    const base = 1060 + Math.sin(i * 0.7 + phase) * 100 + i * 14;
    const change = scenario === 2 ? Math.sin(p * Math.PI * 0.8) * 590 : scenario === 1 ? -p * 280 : 0;
    const median = Math.round(base + change + offset * p);
    const spread = 80 + i * 15;
    return { week: i + 1, median, lo: Math.max(0, median - spread), hi: median + spread, observed: i < 5 ? median + Math.sin(i) * 42 : null };
  });
}

export const reorderQuantity = (data: Point[]) => Math.max(0, Math.round((data[data.length - 1].median * 2 - 1386) / 10) * 10);

/** Cardinal spline through points, as an SVG path. */
export function smooth(points: [number, number][], move = true) {
  if (!points.length) return "";
  let d = move ? `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}` : `L${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const t = 0.16;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Ease displayed values toward the latest data so scenario changes morph. */
function useTween(data: Point[], instant: boolean) {
  const [shown, setShown] = useState(data);
  const from = useRef(data);
  useEffect(() => {
    if (instant || prefersReducedMotion() || from.current.length !== data.length) {
      from.current = data;
      setShown(data);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / 460);
      const e = 1 - Math.pow(1 - k, 3);
      const mix = (x: number, y: number) => x + (y - x) * e;
      const next = data.map((d, i) => ({
        ...d,
        median: mix(a[i].median, d.median),
        lo: mix(a[i].lo, d.lo),
        hi: mix(a[i].hi, d.hi),
        observed: d.observed === null || a[i].observed === null ? d.observed : mix(a[i].observed!, d.observed),
      }));
      setShown(next);
      from.current = next;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [data, instant]);
  return shown;
}

export function Sandbox() {
  const { forecast: c, contact } = useCopy();
  const [scenario, setScenario] = useState(0);
  const [horizon, setHorizon] = useState(13);
  const [offset, setOffset] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [width, setWidth] = useState(720);
  const box = useRef<HTMLDivElement>(null);
  const gid = useId().replace(/:/g, "");
  const data = useMemo(() => series(scenario, horizon, offset), [scenario, horizon, offset]);
  const shown = useTween(data, drag !== null);
  const quantity = reorderQuantity(data);
  const last = data[data.length - 1];

  // Once the visitor changes anything, the scenario and its decision go into the contact message.
  // (Compared with the first values rather than "skip the first effect", which StrictMode runs twice.)
  const initial = useRef(`${scenario}/${quantity}`);
  const touched = useRef(false);
  useEffect(() => {
    touched.current ||= `${scenario}/${quantity}` !== initial.current;
    if (!touched.current) return;
    const qty = quantity.toLocaleString("en-US");
    visit.set("sandbox", { label: `${c.scenarios[scenario]} · ${qty}`, line: contact.sandbox(c.scenarios[scenario], qty) });
  }, [scenario, quantity, c, contact]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = width < 560 ? 250 : 320;
  const m = { l: 46, r: 14, t: 26, b: 30 };
  const yMax = Math.max(2400, Math.ceil(Math.max(...data.map(d => d.hi)) / 400) * 400);
  const x = (i: number) => m.l + (i / (horizon - 1)) * (width - m.l - m.r);
  const y = (v: number) => m.t + (1 - (v - 400) / (yMax - 400)) * (height - m.t - m.b);
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round((400 + ((yMax - 400) * i) / 5) / 100) * 100);
  const hiPts = shown.map((d, i) => [x(i), y(d.hi)] as [number, number]);
  const loPts = shown.map((d, i) => [x(i), y(d.lo)] as [number, number]).reverse();
  const band = `${smooth(hiPts)}${smooth(loPts, false)}Z`;
  const median = smooth(shown.map((d, i) => [x(i), y(d.median)]));
  const obs = shown.filter(d => d.observed !== null).map((d, i) => [x(i), y(d.observed!)] as [number, number]);
  const step = horizon > 13 ? (horizon > 26 ? 8 : 4) : 2;
  const deltas = ["+12.4%", "−18.6%", "+38.2%"];
  const h = hover !== null ? shown[hover] : null;

  const pointerIndex = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - m.l) / (width - m.l - m.r)) * (horizon - 1));
    return Math.max(0, Math.min(horizon - 1, i));
  };

  return (
    <div className="sandbox">
      <div className="sandbox-top">
        <div className="sandbox-product">
          <span className="mono">SKU-1042</span>
          <strong>Essential cotton tee</strong>
        </div>
        <span className="calibrated mono">
          <i aria-hidden="true" />
          Model calibrated
        </span>
      </div>
      <div className="sandbox-toolbar">
        <div className="seg" role="group" aria-label="Forecast scenario">
          {c.scenarios.map((s, i) => (
            <button key={s} aria-pressed={scenario === i} onClick={() => setScenario(i)}>
              {i === 2 && <Zap size={13} aria-hidden="true" />} {s}
            </button>
          ))}
        </div>
        <label className="select">
          <span className="sr-only">Forecast horizon</span>
          <select aria-label="Forecast horizon" value={horizon} onChange={e => setHorizon(+e.target.value)}>
            {[13, 26, 52].map(v => (
              <option key={v} value={v}>
                {c.horizon(v)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sandbox-stats">
        <div>
          <span className="mono">{c.expected}</span>
          <strong>
            <Odometer value={last.median.toLocaleString("en-US")} /> <small>{c.perWeek}</small>
          </strong>
        </div>
        <span className={`delta ${scenario === 1 ? "down" : ""}`}>
          {scenario === 1 ? <TrendingDown size={15} aria-hidden="true" /> : <TrendingUp size={15} aria-hidden="true" />}
          {deltas[scenario]} <span>{c.vsPrior}</span>
        </span>
      </div>
      <div
        ref={box}
        className={`chart ${drag !== null ? "is-dragging" : ""}`}
        data-cursor="Drag"
        onPointerDown={e => {
          setDrag(e.clientX);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={e => {
          setHover(pointerIndex(e.clientX));
          if (drag !== null) {
            setOffset(o => Math.max(-350, Math.min(350, o + (e.clientX - drag) * 2)));
            setDrag(e.clientX);
          }
        }}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        onPointerLeave={() => setHover(null)}
      >
        <svg width={width} height={height} role="img" aria-label={`${c.chartLabel}: ${c.expected} ${last.median} ${c.perWeek}, ${c.range} ${last.lo}–${last.hi}.`}>
          <defs>
            <linearGradient id={`band-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--forecast)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--forecast)" stopOpacity="0.22" />
            </linearGradient>
          </defs>
          <rect x={x(4)} y={m.t} width={width - m.r - x(4)} height={height - m.t - m.b} className="chart-future" />
          {ticks.map(v => (
            <g key={v}>
              <line x1={m.l} x2={width - m.r} y1={y(v)} y2={y(v)} className="chart-grid" />
              <text x={m.l - 10} y={y(v) + 4} textAnchor="end" className="chart-tick">
                {v.toLocaleString("en-US")}
              </text>
            </g>
          ))}
          {shown.map((d, i) =>
            i % step === 0 || i === horizon - 1 ? (
              <text key={d.week} x={x(i)} y={height - 8} textAnchor="middle" className="chart-tick">
                W{d.week}
              </text>
            ) : null,
          )}
          <path d={band} fill={`url(#band-${gid})`} className="chart-band" />
          <path d={smooth(hiPts)} className="chart-edge" />
          <path d={smooth(loPts.slice().reverse())} className="chart-edge" />
          <line x1={x(4)} x2={x(4)} y1={m.t - 8} y2={height - m.b} className="chart-now" />
          <text x={x(4) + 8} y={m.t + 4} className="chart-now-label">
            {c.forecastMark.toUpperCase()} →
          </text>
          <path d={median} className="chart-median" />
          <path d={smooth(obs)} className="chart-observed" />
          {obs.map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r={3.5} className="chart-dot" />
          ))}
          {h && hover !== null && (
            <g className="chart-hover">
              <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={height - m.b} />
              <circle cx={x(hover)} cy={y(h.median)} r={5} />
            </g>
          )}
        </svg>
        {h && hover !== null && (
          <div className="chart-tip mono" style={{ left: Math.min(width - 170, Math.max(0, x(hover) + 12)), top: Math.max(0, y(h.hi) - 10) }}>
            <b>W{h.week}</b>
            <span>
              {c.p50} {Math.round(h.median).toLocaleString("en-US")}
            </span>
            <span>
              {c.range} {Math.round(h.lo).toLocaleString("en-US")}–{Math.round(h.hi).toLocaleString("en-US")}
            </span>
          </div>
        )}
      </div>
      <div className="chart-legend mono">
        <span>
          <i className="lg-observed" />
          {c.actual}
        </span>
        <span>
          <i className="lg-median" />
          {c.p50}
        </span>
        <span>
          <i className="lg-band" />
          {c.range}
        </span>
      </div>
      <div className="sandbox-adjust">
        <label htmlFor={`adjust-${gid}`}>{c.adjust}</label>
        <input
          id={`adjust-${gid}`}
          aria-label="Demand adjustment"
          type="range"
          min={-350}
          max={350}
          value={offset}
          onChange={e => setOffset(+e.target.value)}
          style={{ ["--progress" as string]: `${((offset + 350) / 700) * 100}%` }}
        />
        <output className="mono" htmlFor={`adjust-${gid}`}>
          {offset > 0 ? "+" : ""}
          {offset}
        </output>
        <button
          className="icon-button"
          onClick={() => {
            setOffset(0);
            setScenario(0);
          }}
          aria-label="Reset forecast"
          title={c.reset}
        >
          <RefreshCw size={15} />
        </button>
      </div>
      <p className="sandbox-hint mono">{c.drag}</p>
      <details className="disclosure">
        <summary>{c.technical}</summary>
        <p>{c.techBody}</p>
      </details>
      <div className="decision" aria-live="polite">
        <span className="mono decision-label">
          <i aria-hidden="true" />
          {c.decision}
        </span>
        <p className="decision-qty">
          <PackageCheck size={26} aria-hidden="true" />
          <strong>
            <Odometer value={quantity.toLocaleString("en-US")} variant="board" />
          </strong>
          <span>{c.reorder}</span>
        </p>
        <span className="mono muted">{c.leadTime}</span>
        <span className="mono muted">{c.check}</span>
      </div>
    </div>
  );
}
