import * as T from 'three';

export type Vec = [number, number, number];
export type Lens = { x: number; y: number; r: number; rack: number };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * DOM annotations that live in the scene: rack chips, signal sources, the x-ray tag and the data
 * panels. Positions come from projecting world anchors each rendered frame; sizes are measured
 * once per showing, so the loop writes transforms without reading layout.
 */
export function createAnnotations(host: HTMLElement) {
  const q = (selector: string) => [...host.querySelectorAll<HTMLElement>(selector)];
  const racks = q('[data-rack]'), sources = q('[data-source]'), panels = q('[data-panel]');
  const tag = host.querySelector<HTMLElement>('.xray-tag');
  [...racks, ...sources, ...panels, ...(tag ? [tag] : [])].forEach(el => { el.hidden = false; el.dataset.shown = 'false'; el.setAttribute('aria-hidden', 'true'); });
  const sizes = new Map<HTMLElement, [number, number]>();
  const v = new T.Vector3();
  let width = 1, height = 1;
  const show = (el: HTMLElement, on: boolean) => {
    if (el.dataset.shown !== String(on)) {
      el.dataset.shown = String(on);
      if (el.dataset.panel) el.setAttribute('aria-hidden', String(!on));
      if (on) sizes.set(el, [el.offsetWidth, el.offsetHeight]);
    }
    return on;
  };
  // After a resize the cache is empty; the first frame re-measures whatever is on screen.
  const size = (el: HTMLElement) => { let s = sizes.get(el); if (!s) sizes.set(el, s = [el.offsetWidth, el.offsetHeight]); return s; };
  const project = (camera: T.Camera, p: Vec) => { v.set(...p).project(camera); return [(v.x + 1) / 2 * width, (1 - v.y) / 2 * height, v.z] as const; };
  const place = (el: HTMLElement, x: number, y: number) => { el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`; };
  const onScreen = (x: number, y: number, z: number) => z < 1 && x > 8 && x < width - 8 && y > 80 && y < height - 40;
  return {
    resize(w: number, h: number) { width = w; height = h; sizes.clear(); },
    /**
     * 'all' tags every rack (roof lifted); a Lens labels only the rack under the x-ray. Tags never
     * overlap: left to right, each takes the first free spot above its rack, stacked higher, or below
     * it, never above `safeTop` (the chapter copy). A hairline leader runs back to the rack.
     */
    racks(camera: T.Camera, anchors: Vec[], mode: 'off' | 'all' | Lens, safeTop = 88) {
      if (mode === 'all') {
        const placed: [number, number, number, number][] = [];
        const order = anchors.map((a, i) => [i, ...project(camera, a)] as const).sort((a, b) => a[1] - b[1]);
        for (const [i, x, y, z] of order) {
          const el = racks[i];
          el.dataset.mode = 'tag';
          if (!show(el, onScreen(x, y, z))) continue;
          const [w, h] = size(el), left = clamp(x - w / 2, 12, width - w - 12);
          const free = (top: number) => placed.every(([l, t, r, b]) => left + w + 4 <= l || left >= r + 4 || top + h + 4 <= t || top >= b + 4);
          const spots = [y - h - 10, y - 2 * h - 18, y - 3 * h - 26, y + 12, y + h + 20].filter(top => top >= safeTop && top + h <= height - 16);
          const top = spots.find(free) ?? spots[0] ?? y - h - 10;
          placed.push([left, top, left + w, top + h]);
          place(el, left, top);
          const below = top > y;
          el.dataset.below = String(below);
          el.style.setProperty('--lead', `${Math.max(0, below ? top - y : y - top - h).toFixed(1)}px`);
          el.style.setProperty('--lead-x', `${clamp(x - left, 8, w - 8).toFixed(1)}px`);
        }
      }
      racks.forEach((el, i) => {
        if (mode === 'all') return;
        if (mode === 'off' || mode.rack !== i) { show(el, false); return; }
        el.dataset.mode = 'lens';
        // Beside the lens, else centred under it; never over the copy above `safeTop` or off screen.
        const [w, h] = size(el), edge = mode.r * .72;
        let left = mode.x + edge + 12, top = Math.max(safeTop, mode.y - h * .5);
        if (left + w > width - 12) left = mode.x - edge - 12 - w;
        if (left < 12) { left = clamp(mode.x - w / 2, 12, width - w - 12); top = Math.max(safeTop, mode.y + edge + 10); }
        if (show(el, mode.r > 24 && top + h <= height - 16)) place(el, left, top);
      });
      if (tag) {
        const lens = typeof mode === 'object' ? mode : null, [w, h] = size(tag);
        const x = lens ? lens.x - lens.r * .72 - w - 6 : 0, y = lens ? lens.y - lens.r * .72 - h : 0;
        if (show(tag, !!lens && lens.r > 24 && y >= safeTop && x >= 8)) place(tag, x, y);
      }
    },
    sources(camera: T.Camera, anchors: Vec[], opacity: number) {
      sources.forEach((el, i) => {
        const [x, y, z] = project(camera, anchors[i]);
        if (!show(el, opacity > .35 && onScreen(x, y, z))) return;
        const [w, h] = size(el);
        place(el, clamp(x - w / 2, 12, width - w - 12), y - h - 12);
      });
    },
    /** One panel at a time, beside its rack, kept between the chapter heading and the reading card. */
    panel(camera: T.Camera, id: string | null, anchor: Vec, t: number, safeTop: number, safeBottom: number) {
      panels.forEach(el => {
        if (el.dataset.panel !== id) { show(el, false); return; }
        const [ax, ay, z] = project(camera, anchor);
        const [w, h] = size(el), gap = width < 760 ? 26 : 46;
        // A panel that cannot fit between the heading and the card would cover reading text: skip it.
        if (!show(el, z < 1 && ax > 0 && ax < width && safeBottom - safeTop >= h * .92)) return;
        const right = ax + gap + w < width - 14 || ax - gap - w < 14;
        const left = clamp(right ? ax + gap : ax - gap - w, 10, width - w - 10);
        const top = clamp(ay - h * .55, safeTop, Math.max(safeTop, safeBottom - h));
        place(el, left, top);
        el.dataset.side = right ? 'right' : 'left';
        // The leader runs from the rack to the panel's near edge.
        const ex = right ? left : left + w, ey = clamp(ay, top + 16, top + h - 16);
        const leader = el.querySelector<HTMLElement>('.panel-leader');
        if (leader) {
          const dx = ax - ex, dy = ay - ey;
          leader.style.cssText = `left:${(ex - left).toFixed(1)}px;top:${(ey - top).toFixed(1)}px;width:${Math.hypot(dx, dy).toFixed(1)}px;rotate:${Math.atan2(dy, dx).toFixed(4)}rad`;
        }
        el.style.setProperty('--t', t.toFixed(3));
        el.querySelectorAll<HTMLElement>('[data-count]').forEach(n => { n.textContent = Math.round(Number(n.dataset.count) * clamp(t * 1.25, 0, 1)).toLocaleString('en-IN'); });
      });
    },
  };
}
