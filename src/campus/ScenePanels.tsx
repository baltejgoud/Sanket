import type { CSSProperties, ReactNode } from 'react';
import type { Lang } from '../i18n';
import { sceneCopy } from './sceneCopy';

/**
 * Everything the 3D scene says for itself: rack status chips, signal sources and data panels.
 * They start hidden; the engine reveals them once WebGL (and its stylesheet) is running, then
 * anchors each to its rack and scrubs the graphics with --t (0–1 through the current beat).
 */
const style = (vars: Record<string, string | number>) => vars as CSSProperties;

/** Digits roll up from zero when the panel shows; the plain value is what assistive tech reads. */
function Roll({ value }: { value: string }) {
  let k = 0;
  return <span className="roll-num"><span className="sr-only">{value}</span>{(value.match(/\d|\D+/g) ?? []).map((part, i) => /\d/.test(part)
    ? <span key={i} className="rd" aria-hidden="true" style={style({ '--d': +part, '--k': k++ })} />
    : <span key={i} aria-hidden="true">{part}</span>)}</span>;
}

function Panel({ id, tone, title, children }: { id: string; tone: 'signal' | 'mint' | 'amber'; title: string; children: ReactNode }) {
  return <div className={`scene-panel tone-${tone}`} data-panel={id} role="group" aria-label={title} aria-hidden="true" hidden>
    <span className="panel-leader" aria-hidden="true"><i /></span>
    <p className="panel-title"><i className="panel-dot" aria-hidden="true" />{title}</p>
    {children}
  </div>;
}

export function ScenePanels({ lang }: { lang: Lang }) {
  const c = sceneCopy[lang];
  const values = ['1,200', '200', '400', '200', '800'];
  return <>
    <span className="xray-tag mono" aria-hidden="true" hidden>{c.xray}</span>
    {c.racks.map(([name, detail], i) => <div key={i} className={`rack-chip rack-${i}`} data-rack={i} aria-hidden="true" hidden><i /><strong><span className="rack-long">{name}</span><span className="rack-short">{c.racksShort[i]}</span></strong><small>{detail}</small></div>)}
    {c.sources.map((name, i) => <div key={i} className="source-chip" data-source={i} aria-hidden="true" hidden><i />{name}</div>)}

    <Panel id="gap" tone="signal" title={c.gap.title}>
      <p className="panel-figure"><Roll value="400" /><span>{c.gap.onHand}</span></p>
      <p className="panel-note">{c.gap.rate}</p>
      <div className="gap-track" aria-hidden="true"><span className="gap-fill" /><span className="gap-hole" /><i className="gap-tick" /><i className="gap-tick end" /></div>
      <p className="gap-labels"><span>{c.gap.today}</span><span>{c.gap.lasts}</span><span>{c.gap.delivery}</span></p>
      <p className="gap-empty">{c.gap.empty}</p>
    </Panel>

    <Panel id="out" tone="signal" title={c.out.title}>
      <div className="out-row"><span className="out-gauge" aria-hidden="true"><i /></span><p className="panel-figure big"><span>0</span><span>{c.out.left}</span></p></div>
      <p className="panel-figure"><span data-count="86">0</span><span>{c.out.waiting}</span></p>
      <span className="out-stamp" aria-hidden="true">{c.out.stamp}</span>
    </Panel>

    <Panel id="slow" tone="amber" title={c.slow.title}>
      <div className="slow-row"><span className="slow-bars" aria-hidden="true"><i /><i /></span><p className="panel-figure big"><Roll value="120" /><span>{c.slow.days}</span></p></div>
      <p className="panel-note">{c.slow.note}</p>
    </Panel>

    <Panel id="forecast" tone="mint" title={c.forecast.title}>
      <p className="panel-figure"><Roll value="1,200" /><span>{c.forecast.units}</span></p>
      <svg className="fc-chart" viewBox="0 0 200 64" aria-hidden="true">
        <path className="fc-grid" d="M0 56H200M0 36H200M0 16H200" />
        <path className="fc-band" d="M12 38L70 26L128 15L186 6L186 27L128 31.5L70 37.5L12 45.5Z" />
        <path className="fc-line" d="M12 41.8L70 31.6L128 23.2L186 16.4" pathLength={1} />
        {[[12, 41.8], [70, 31.6], [128, 23.2], [186, 16.4]].map(([x, y], i) => <circle key={i} className="fc-dot" cx={x} cy={y} r="2.6" style={style({ '--k': i })} />)}
      </svg>
      <p className="fc-axis" aria-hidden="true">{[1, 2, 3, 4].map(w => <span key={w}>{c.forecast.week} {w}</span>)}</p>
      <p className="panel-note">{c.forecast.band}</p>
    </Panel>

    <Panel id="order" tone="mint" title={c.order.title}>
      <ol className="order-sum">{c.order.rows.map((label, i) => <li key={i} style={style({ '--k': i })}><span>{label}</span>{i === 4 ? <strong><Roll value={values[i]} /></strong> : <span>{values[i]}</span>}</li>)}</ol>
    </Panel>

    <Panel id="transfer" tone="mint" title={c.transfer.title}>
      <p className="panel-figure"><Roll value="360" /><span>{c.transfer.units}</span></p>
      <div className="route" aria-hidden="true"><span>{c.transfer.from}</span><span className="route-line"><i /></span><span>{c.transfer.to}</span></div>
    </Panel>

    <Panel id="markdown" tone="amber" title={c.markdown.title}>
      <div className="price-tag"><i aria-hidden="true" /><span className="price-flap"><Roll value="−12%" /></span></div>
      <p className="panel-note">{c.markdown.note}</p>
    </Panel>
  </>;
}
