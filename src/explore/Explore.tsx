import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { Radio, Smartphone, Target, X } from "lucide-react";
import { useCopy } from "../copy";
import type { Lang } from "../i18n";
import { getLenis } from "../lib/motion";
import { useMotion } from "../lib/prefs";
import { fieldStore, type Readout } from "../field/store";
import { useField } from "../field/bridge";
import { startTilt, tiltSupported } from "../field/tilt";
import { TIMELINE_STOPS } from "../field/timeline";
import { exploreCopy } from "./exploreCopy";
import "../styles/explore.css";

/**
 * Explore mode: the page steps aside and the visitor flies over the live field (the same canvas,
 * no second WebGL context). A modal dialog, so the story behind is inert; the viewport is a
 * keyboard-operable application with written instructions; selections are announced politely.
 */
const restorePage = () => {
  document.documentElement.classList.remove("is-exploring");
  getLenis()?.start();
};

export default function Explore({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const copy = exploreCopy[lang];
  const { stage, rail } = useCopy();
  const field = useField();
  const calm = useMotion() === "calm";
  const uid = useId().replace(/:/g, "");
  const dialog = useRef<HTMLDialogElement>(null);
  const view = useRef<HTMLDivElement>(null);
  const down = useRef<[number, number] | null>(null);
  const [v, setV] = useState(0);
  const [said, setSaid] = useState("");
  const [stopTilt, setStopTilt] = useState<(() => void) | null>(null);
  const readout = useSyncExternalStore(fieldStore.subscribeReadout, () => fieldStore.get().readout);

  // Open: hide the page, hold the scroll, focus the viewport. Close: undo all of it, before focus
  // goes back to the opener (a hidden element cannot take focus).
  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
    document.documentElement.classList.add("is-exploring");
    getLenis()?.stop();
    view.current?.focus();
    return restorePage;
  }, []);

  // Hand the camera over while the field runs; if it falls back to the poster, close.
  useEffect(() => {
    if (!field) {
      dialog.current?.close();
      return;
    }
    field.setExplore(true, view.current ?? undefined);
    return () => void field.setExplore(false);
  }, [field]);

  useEffect(() => field?.exploreTimeline(v), [field, v]);
  useEffect(() => () => stopTilt?.(), [stopTilt]);

  const describe = (r: Readout | null) =>
    r ? `${r.sku}, ${r.location}. ${stage.onHand} ${r.onHand}, ${stage.need} ${r.need}. ${stage.status[r.status]}.` : copy.none;

  const next = () => setSaid(describe(field?.nextStockout() ?? null));
  // The viewport takes the flight keys; N (the next stockout) works anywhere in the dialog.
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!field) return;
    if (e.key === "Enter" || e.key === " ") field.signalAtSelection();
    else if (!field.exploreKey(e.key)) return;
    e.preventDefault();
  };
  const onDialogKey = (e: KeyboardEvent<HTMLDialogElement>) => {
    if ((e.key === "n" || e.key === "N") && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      next();
    }
  };

  const ndc = (e: PointerEvent): [number, number] => [(e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1];
  const onPointerMove = (e: PointerEvent) => e.pointerType === "mouse" && field?.setPointer(...ndc(e), true);
  const onPointerDown = (e: PointerEvent) => (down.current = [e.clientX, e.clientY]);
  // A tap or click that did not drag selects the column under it.
  const onPointerUp = (e: PointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!field || !d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 6) return;
    field.setPointer(...ndc(e), true);
    const r = field.selectAtPointer();
    if (r) setSaid(describe(r));
  };

  const toggleTilt = async () => {
    if (stopTilt) {
      stopTilt();
      setStopTilt(null);
      return;
    }
    const stop = field ? await startTilt((x, y) => field.setTilt(x, y)) : null;
    if (stop) setStopTilt(() => stop);
  };

  const stopAt = TIMELINE_STOPS.reduce((best, s, n) => (Math.abs(s - v) < Math.abs(TIMELINE_STOPS[best] - v) ? n : best), 0);

  return (
    <dialog ref={dialog} className="explore" aria-labelledby={`${uid}-title`} onClose={() => {
        restorePage();
        onClose();
      }}
      onKeyDown={onDialogKey} data-lenis-prevent>
      <div
        ref={view}
        className="explore-view"
        role="application"
        aria-roledescription={copy.role}
        aria-labelledby={`${uid}-title`}
        aria-describedby={`${uid}-help`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
      <header className="explore-bar">
        <div>
          <p className="mono">{copy.eyebrow}</p>
          <h2 id={`${uid}-title`}>{copy.title}</h2>
        </div>
        <button className="explore-close" onClick={() => dialog.current?.close()}>
          <X size={18} aria-hidden="true" />
          <span>{copy.close}</span>
          <kbd aria-hidden="true">Esc</kbd>
        </button>
      </header>
      <div className="explore-panel">
        <div className="explore-timeline">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={v}
            aria-label={copy.timeline}
            aria-valuetext={rail[stopAt]}
            onChange={e => setV(+e.target.value)}
            style={{ ["--progress" as string]: `${v * 100}%` }}
          />
          <div className="explore-stops">
            {TIMELINE_STOPS.map((s, n) => (
              <button key={n} className={n === stopAt ? "is-on" : ""} style={{ ["--at" as string]: `${s * 100}%` }} onClick={() => setV(s)} tabIndex={-1}>
                {rail[n]}
              </button>
            ))}
          </div>
        </div>
        <div className="explore-row">
          <div className={`explore-readout mono ${readout ? "has-cell" : ""}`}>
            {readout ? (
              <dl>
                <div>
                  <dt>{readout.sku}</dt>
                  <dd>{readout.location}</dd>
                </div>
                <div>
                  <dt>{stage.onHand}</dt>
                  <dd>{readout.onHand}</dd>
                </div>
                <div>
                  <dt>{stage.need}</dt>
                  <dd>{readout.need}</dd>
                </div>
                <div className={`status status-${readout.status}`}>
                  <dd>{stage.status[readout.status]}</dd>
                </div>
              </dl>
            ) : (
              <p>{copy.hint}</p>
            )}
          </div>
          <div className="explore-actions">
            <button className="explore-btn" onClick={next}>
              <Target size={16} aria-hidden="true" />
              {copy.next}
              <kbd aria-hidden="true">N</kbd>
            </button>
            <button className="explore-btn" onClick={() => field?.signalAtSelection()} disabled={calm}>
              <Radio size={16} aria-hidden="true" />
              {copy.signal}
            </button>
            {tiltSupported() && !calm && (
              <button className="explore-btn" aria-pressed={!!stopTilt} onClick={toggleTilt}>
                <Smartphone size={16} aria-hidden="true" />
                {stopTilt ? copy.tiltOff : copy.tilt}
              </button>
            )}
          </div>
        </div>
        <p id={`${uid}-help`} className="explore-help mono">
          {copy.help} {stage.illustrative}.
        </p>
        <p className="sr-only" role="status">
          {said}
        </p>
      </div>
    </dialog>
  );
}
