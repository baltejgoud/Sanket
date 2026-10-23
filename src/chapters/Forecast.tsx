import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { useT } from "../i18n";
import { useCopy } from "../copy";
import { useFieldScene } from "../field/useFieldScene";
import { useReveal, useSheen } from "../lib/motion";
import { RevealHeading } from "../components/Words";
import { Sandbox } from "./Sandbox";

function Film() {
  const c = useCopy().film;
  const [started, setStarted] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = video.current;
    if (!started || !el) return;
    el.focus();
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && el.pause(), { threshold: 0.15 });
    const onHide = () => document.hidden && el.pause();
    io.observe(el);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [started]);
  return (
    <figure className="film" id="film">
      <div className="film-frame">
        {started ? (
          <video ref={video} tabIndex={0} controls autoPlay playsInline preload="metadata" poster="/assets/order-film-poster.jpg" aria-label={c.play}>
            <source src="/assets/order-film.mp4" type="video/mp4" />
            <track kind="captions" src="/assets/order-film.vtt" srcLang="en" label="English" />
          </video>
        ) : (
          <button className="film-play" onClick={() => setStarted(true)} aria-label={c.play} data-cursor="Play">
            <img src="/assets/order-film-poster.jpg" loading="lazy" alt="" width={1280} height={720} />
            <span className="film-button">
              <Play size={18} fill="currentColor" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <span className="mono accent">{c.film}</span>
        <strong>{c.title}</strong>
        <span className="muted">{c.desc}</span>
        <span className="mono muted">{c.example}</span>
      </figcaption>
    </figure>
  );
}

export function Forecast() {
  const t = useT();
  const c = useCopy();
  const scene = useReveal<HTMLElement>(0.2);
  const instrument = useReveal<HTMLElement>(0.08);
  const panel = useSheen<HTMLDivElement>();
  useFieldScene(scene, { shot: "forecast", signal: 0.2, forecast: 1, level: 0, focus: -1 });

  return (
    <>
      <section ref={scene} id="forecast" className="chapter forecast-scene" data-field="show" aria-labelledby="forecast-title">
        <span id="how" className="alias" />
        <div className="wrap forecast-grid">
          <p className="plate mono rule-in">
            <b>02</b> {c.forecast.plate}
          </p>
          <RevealHeading id="forecast-title" className="display h2 forecast-title" lines={[t.how.title]} />
          <p className="lead muted fade" style={{ ["--d" as string]: "300ms" }}>
            {t.how.desc}
          </p>
          <p className="band-key fade" style={{ ["--d" as string]: "450ms" }}>
            <i aria-hidden="true" />
            {c.forecast.band}
          </p>
          <ol className="steps">
            {t.how.steps.map((s, i) => (
              <li key={i} className="fade" style={{ ["--d" as string]: `${500 + i * 120}ms` }}>
                <span className="mono step-n">0{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="chips mono">{s.chips.join(" · ")}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section ref={instrument} id="command" className="chapter light instrument" aria-labelledby="command-title">
        <div className="wrap">
          <header className="instrument-head">
            <p className="plate mono rule-in">
              <b>02·2</b> {t.command.eyebrow}
            </p>
            <RevealHeading id="command-title" className="display instrument-title" lines={[t.command.title]} />
            <p className="muted measure fade">{t.command.desc}</p>
          </header>
          <div className="instrument-grid">
            <div ref={panel} className="instrument-panel fade">
              <Sandbox />
            </div>
            <Film />
          </div>
        </div>
      </section>
    </>
  );
}
