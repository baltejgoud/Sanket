import type { FieldModel } from "./model";
import type { Shot } from "./store";

/**
 * What the field's projector casts onto the stock in each chapter. The projector is a top-down
 * parallel light: a canvas texture mapped onto the columns' tops (full strength), their sides
 * (a streak) and the floor (a spill). Seen from the story camera, marks on columns of different
 * heights separate, so projected words break up on the unbalanced field and read once it is level.
 *
 * Channels: plain slides draw in white and are read through red. The decide slide puts each
 * decision in its own channel (orders red, transfers green, markdowns blue) so each set of floor
 * markings can fade with its own decision window from one texture.
 */
export type Slide = "instock-faint" | "signals" | "reticle" | "off" | "decide" | "instock";

export interface ProjectionCopy {
  inStock: string;
  signals: string[];
  /** the page language, for the display face */
  lang: string;
}

export function slideFor(shot: Shot): Slide {
  switch (shot) {
    case "hero":
      return "instock-faint";
    case "signal":
      return "signals";
    case "problems":
      return "reticle";
    case "decide":
      return "decide";
    case "level":
      return "instock";
    default:
      return "off";
  }
}

/** How strongly each slide is lit, 0..1. */
export const SLIDE_STRENGTH: Record<Slide, number> = { "instock-faint": 0.42, signals: 1, reticle: 0.9, off: 0, decide: 1, instock: 1 };

/** Projected light colour per slide (linear-ish RGB, 0..1). */
export const SLIDE_COLOR: Record<Slide, [number, number, number]> = {
  "instock-faint": [1, 0.93, 0.84],
  signals: [1, 0.42, 0.16],
  reticle: [1, 0.42, 0.16],
  off: [0, 0, 0],
  decide: [1, 0.95, 0.88],
  instock: [1, 0.95, 0.86],
};

/** The projector's footprint on the ground: the field plus a cell of margin each side. */
export function projectionRect(m: FieldModel) {
  return { minX: -m.width / 2 - 1, minZ: -m.depth / 2 - 1, sizeX: m.width + 2, sizeZ: m.depth + 2 };
}

const displayFace = (lang: string) =>
  lang === "hi" ? `"Tiro Devanagari Hindi", "Noto Sans Devanagari", serif` : lang === "te" ? `"Tiro Telugu", "Noto Sans Telugu", serif` : `Archivo, "Arial Narrow", sans-serif`;

/** Ask the browser for the faces a slide uses; resolves when they can draw (or fail). */
export function loadFaces(copy: ProjectionCopy) {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return Promise.resolve();
  return Promise.all([fonts.load(`800 64px ${displayFace(copy.lang)}`, copy.inStock), fonts.load(`500 32px "IBM Plex Mono"`, "SIGNAL")]).then(
    () => undefined,
    () => undefined,
  );
}

export function drawSlide(ctx: CanvasRenderingContext2D, slide: Slide, m: FieldModel, copy: ProjectionCopy, focus: number) {
  const { width: W, height: H } = ctx.canvas;
  const r = projectionRect(m);
  /** ground (x, z) → canvas pixels; canvas top is the far side of the field */
  const at = (x: number, z: number): [number, number] => [((x - r.minX) / r.sizeX) * W, ((z - r.minZ) / r.sizeZ) * H];
  const unit = W / r.sizeX; // pixels per ground unit (one cell)
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (slide === "instock" || slide === "instock-faint") {
    // A compact block, one word per line, just right of centre (the story's copy sits left).
    const latin = copy.lang === "en";
    const lines = (latin ? copy.inStock.toUpperCase() : copy.inStock).split(/\s+/).filter(Boolean);
    const c = ctx as CanvasRenderingContext2D & { fontStretch?: string; letterSpacing?: string };
    c.fontStretch = "expanded";
    const face = (px: number) => {
      c.font = `800 ${px}px ${displayFace(copy.lang)}`;
      if (latin) c.letterSpacing = `${(px * 0.03).toFixed(1)}px`;
    };
    let size = (H * 0.62) / lines.length / 0.92;
    face(size);
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    size *= Math.min(1, (W * 0.44) / Math.max(1, widest));
    face(size);
    const [cx, cy] = at(m.width * 0.03, m.depth * 0.03);
    const lead = size * 0.92;
    lines.forEach((l, n) => ctx.fillText(l, cx, cy + (n - (lines.length - 1) / 2) * lead));
    // A registration rule under the block, as on a projection test card.
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width));
    ctx.fillRect(cx - tw / 2, cy + (lines.length / 2) * lead + size * 0.08, tw, Math.max(2, unit * 0.2));
  }

  if (slide === "signals") {
    ctx.font = `600 ${Math.round(unit * 2.3)}px "IBM Plex Mono", monospace`;
    m.signalOrigins.forEach((o, n) => {
      const [ox, oy] = at(o.x, o.z);
      // Ripples entering from the edge…
      ctx.lineWidth = Math.max(2, unit * 0.32);
      for (let k = 1; k <= 4; k++) {
        ctx.globalAlpha = 1 - k * 0.2;
        ctx.beginPath();
        ctx.arc(ox, oy, unit * (2.4 + k * 2.6), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // …and the signal's name written along the field, reading toward the centre.
      const [cx, cy] = at(0, 0);
      const angle = Math.atan2(cy - oy, cx - ox);
      const label = (copy.signals[n] ?? "").toUpperCase();
      ctx.save();
      ctx.translate(ox + Math.cos(angle) * unit * 9, oy + Math.sin(angle) * unit * 9);
      ctx.rotate(Math.abs(angle) > Math.PI / 2 ? angle + Math.PI : angle);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  }

  if (slide === "reticle") {
    const f = m.foci[Math.max(0, focus)];
    if (f) {
      const [fx, fy] = at(f.x, f.z);
      const rad = f.r * unit;
      ctx.lineWidth = Math.max(2, unit * 0.14);
      ctx.beginPath();
      ctx.arc(fx, fy, rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(fx, fy, rad * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // Crosshair ticks and long guide lines to the field's edges.
      ctx.lineWidth = Math.max(1.5, unit * 0.08);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        ctx.beginPath();
        ctx.moveTo(fx + dx * rad * 0.7, fy + dy * rad * 0.7);
        ctx.lineTo(fx + dx * rad * 1.15, fy + dy * rad * 1.15);
        ctx.stroke();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(fx + dx * rad * 1.4, fy + dy * rad * 1.4);
        ctx.lineTo(fx + dx * W, fy + dy * H);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }

  if (slide === "decide") {
    // Orders (red): a plus over each pit being refilled.
    ctx.fillStyle = "#f00";
    const s = unit * 0.34;
    const bar = Math.max(2, unit * 0.13);
    for (let k = 0; k < m.count; k++) {
      if (m.decision[k] !== 1) continue;
      const [x, y] = at(m.pos[k * 2], m.pos[k * 2 + 1]);
      ctx.fillRect(x - s, y - bar / 2, s * 2, bar);
      ctx.fillRect(x - bar / 2, y - s, bar, s * 2);
    }
    // Transfers (green): a dashed route with chevrons, from surplus to shortage.
    ctx.strokeStyle = "#0f0";
    ctx.lineWidth = Math.max(1.5, unit * 0.09);
    const t = m.travellers;
    for (let n = 0; n < t.count; n++) {
      if (t.kind[n] !== 0) continue;
      const [ax, ay] = at(t.from[n * 3], t.from[n * 3 + 2]);
      const [bx, by] = at(t.to[n * 3], t.to[n * 3 + 2]);
      const len = Math.hypot(bx - ax, by - ay);
      if (len < unit) continue;
      ctx.setLineDash([unit * 0.35, unit * 0.3]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      const a = Math.atan2(by - ay, bx - ax);
      const h = unit * 0.42;
      ctx.beginPath();
      ctx.moveTo(bx - Math.cos(a - 0.6) * h, by - Math.sin(a - 0.6) * h);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx - Math.cos(a + 0.6) * h, by - Math.sin(a + 0.6) * h);
      ctx.stroke();
    }
    // Markdowns (blue): a percent tag on dead stock.
    ctx.fillStyle = "#00f";
    ctx.font = `700 ${Math.round(unit * 0.62)}px "IBM Plex Mono", monospace`;
    for (let k = 0; k < m.count; k++) {
      if (m.decision[k] !== 3) continue;
      const [x, y] = at(m.pos[k * 2], m.pos[k * 2 + 1]);
      ctx.fillText("%", x, y);
    }
  }
  ctx.restore();
}

/** Decide slide: how visible each decision's markings are at this point of the scrub. */
export function decideMask(d: number): [number, number, number] {
  const s = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  return [s(0, 0.04, d) * (1 - s(0.3, 0.42, d)), s(0.2, 0.26, d) * (1 - s(0.56, 0.68, d)), s(0.46, 0.52, d) * (1 - s(0.78, 0.9, d))];
}
