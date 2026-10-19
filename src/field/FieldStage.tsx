import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useIdle, useReducedMotion } from "../lib/motion";
import { fieldStore, type Readout } from "./store";
import type { StockField } from "./StockField";
import type { FieldModel } from "./model";

type Mode = "pending" | "webgl" | "poster";

export interface StageCopy {
  readout: string;
  onHand: string;
  need: string;
  status: Record<Readout["status"], string>;
  hint: string;
  hintTouch: string;
  illustrative: string;
  surplus: string;
  shortage: string;
  signals: string[];
}

const isPoster = () => typeof location !== "undefined" && new URLSearchParams(location.search).has("poster");

function capable() {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

function gridFor(width: number): [number, number] {
  if (width >= 1100) return [48, 28];
  if (width >= 700) return [36, 22];
  return [24, 16];
}

/** The fixed scene behind the whole story. */
export function FieldStage({ copy }: { copy: StageCopy }) {
  const reduced = useReducedMotion();
  const poster = isPoster();
  const idle = useIdle(poster ? 0 : 120);
  const [mode, setMode] = useState<Mode>("pending");
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<StockField | null>(null);
  const anchorRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    setMode(capable() ? "webgl" : "poster");
  }, []);

  // Boot the renderer once the page has painted.
  useEffect(() => {
    if (mode !== "webgl" || !idle || !canvasRef.current) return;
    let cancelled = false;
    let field: StockField | null = null;
    import("./StockField")
      .then(({ StockField }) => {
        if (cancelled || !canvasRef.current) return;
        const [cols, rows] = gridFor(window.innerWidth);
        const anchors = anchorRefs.current
          .map((el, n) => (el ? { el, at: anchorAt(n) } : null))
          .filter(Boolean) as { el: HTMLElement; at: (m: FieldModel) => [number, number, number] }[];
        try {
          field = new StockField({
            canvas: canvasRef.current,
            cols,
            rows,
            dpr: Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 1.75),
            reducedMotion: reduced,
            poster,
            anchors,
            onFail: () => setMode("poster"),
          });
        } catch {
          setMode("poster");
          return;
        }
        fieldRef.current = field;
        field.start();
        requestAnimationFrame(() => setReady(true));
      })
      .catch(() => setMode("poster"));
    return () => {
      cancelled = true;
      field?.dispose();
      fieldRef.current = null;
      setReady(false);
    };
  }, [mode, idle, reduced, poster]);

  // Resize with the canvas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => fieldRef.current?.resize());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [mode]);

  // Pointer: parallax everywhere, readout and signals over field zones.
  useEffect(() => {
    if (mode !== "webgl") return;
    const move = (e: PointerEvent) => {
      const f = fieldRef.current;
      if (!f) return;
      const zone = (e.target as Element | null)?.closest?.("[data-field-zone]");
      f.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, !!zone && e.pointerType === "mouse");
    };
    const down = (e: PointerEvent) => {
      const f = fieldRef.current;
      if (!f || !(e.target as Element | null)?.closest?.("[data-field-zone]")) return;
      f.setPointer((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1, true);
      f.signalAtPointer();
      if (e.pointerType !== "mouse") window.setTimeout(() => f.setPointer(0, 0, false), 600);
    };
    const leave = () => fieldRef.current?.setPointer(0, 0, false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [mode]);

  // Pause whenever no scene chapter is on screen.
  useEffect(() => {
    const shown = new Set<Element>();
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) e.isIntersecting ? shown.add(e.target) : shown.delete(e.target);
        fieldStore.setVisible(shown.size > 0);
      },
      { rootMargin: "40px 0px" },
    );
    const observe = () => document.querySelectorAll('[data-field="show"]').forEach(el => io.observe(el));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: false });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Mirror the current shot onto the stage so labels can show per chapter.
  useEffect(() => {
    const sync = () => {
      const s = fieldStore.get();
      if (!rootRef.current) return;
      rootRef.current.dataset.shot = s.target.shot;
      rootRef.current.dataset.visible = String(s.visible);
    };
    sync();
    return fieldStore.subscribe(sync);
  }, []);

  return (
    <div ref={rootRef} className={`stage stage-${mode} ${ready ? "is-ready" : ""} ${poster ? "is-poster" : ""}`} aria-hidden="true">
      {mode === "poster" && (
        <img className="stage-poster" src="/assets/stock-field.jpg" alt="" width={1600} height={1000} onError={e => (e.currentTarget.style.display = "none")} />
      )}
      {mode !== "poster" && <canvas ref={canvasRef} className="stage-canvas" />}
      <div className="stage-anchors">
        {[copy.surplus, copy.shortage, ...copy.signals.slice(0, 3)].map((label, n) => (
          <span key={n} ref={el => (anchorRefs.current[n] = el)} className={`anchor anchor-${n < 2 ? "decide" : "signal"}`}>
            <i />
            <b className="mono">{label}</b>
          </span>
        ))}
      </div>
      {!poster && <ReadoutHud copy={copy} touch={coarse} />}
    </div>
  );
}

function anchorAt(n: number) {
  return (m: FieldModel): [number, number, number] => {
    if (n === 0) return [m.pos[m.feature.from * 2], m.stock0[m.feature.from] + 0.6, m.pos[m.feature.from * 2 + 1]];
    if (n === 1) return [m.pos[m.feature.to * 2], 0.4, m.pos[m.feature.to * 2 + 1]];
    const o = m.signalOrigins[n - 2];
    return [o.x * 0.86, 0.6, o.z * 0.86];
  };
}

function ReadoutHud({ copy, touch }: { copy: StageCopy; touch: boolean }) {
  const r = useSyncExternalStore(fieldStore.subscribeReadout, () => fieldStore.get().readout);
  return (
    <div className={`readout ${r ? "has-cell" : ""}`}>
      <span className="mono readout-title">
        <i />
        {copy.readout}
      </span>
      {r ? (
        <dl className="mono">
          <div>
            <dt>{r.sku}</dt>
            <dd>{r.location}</dd>
          </div>
          <div>
            <dt>{copy.onHand}</dt>
            <dd>{r.onHand}</dd>
          </div>
          <div>
            <dt>{copy.need}</dt>
            <dd>{r.need}</dd>
          </div>
          <div className={`status status-${r.status}`}>
            <dt className="sr-only">Status</dt>
            <dd>{copy.status[r.status]}</dd>
          </div>
        </dl>
      ) : (
        <p className="mono readout-hint">{touch ? copy.hintTouch : copy.hint}</p>
      )}
      <p className="mono readout-note">{copy.illustrative}</p>
    </div>
  );
}
