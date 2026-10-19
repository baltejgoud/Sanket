/**
 * The Stock Field data model. Pure and seeded, so every visit (and the poster
 * render) sees the same field.
 *
 * Every cell is one product at one location. Height is units on hand.
 * The unbalanced field encodes the six inventory problems the site describes:
 *  0 best-sellers sell out      → stockout pits in high-demand areas
 *  1 warehouse full of slow stock → dead-stock towers far from demand
 *  2 forecast lives in a spreadsheet → one flat guess applied to a whole patch
 *  3 new launch, no history       → a row with no stock and no history
 *  4 the world changes overnight  → where outside signals enter the field
 *  5 right stock, wrong place     → a surplus tower beside an empty pit
 */

export type Decision = 0 | 1 | 2 | 3; // drift, order, transfer, markdown
export const FLAG_NEW = 1;
export const FLAG_SHEET = 2;
/** Global height scale: one unit of height is forty units of stock. */
const HEIGHT = 0.8;

export interface Focus {
  x: number;
  z: number;
  r: number;
}

export interface FieldModel {
  cols: number;
  rows: number;
  count: number;
  spacing: number;
  width: number;
  depth: number;
  /** x, z centre of each cell */
  pos: Float32Array;
  /** unbalanced stock height */
  stock0: Float32Array;
  /** balanced (forecast-led) stock height */
  stock1: Float32Array;
  /** forecast band: low / high */
  lo: Float32Array;
  hi: Float32Array;
  decision: Float32Array;
  /** 0..1 stagger inside the decision's window */
  delay: Float32Array;
  seed: Float32Array;
  flags: Float32Array;
  travellers: {
    count: number;
    from: Float32Array;
    to: Float32Array;
    /** 0 transfer arc, 1 order drop */
    kind: Float32Array;
    delay: Float32Array;
  };
  foci: Focus[];
  /** featured transfer, used for labels */
  feature: { from: number; to: number; units: number };
  /** where outside signals enter (problem 4) */
  signalOrigins: { x: number; z: number }[];
}

/** Decision windows inside the 0..1 decide scrub. Shared with the shader. */
export const WINDOWS: Record<Decision, [number, number]> = {
  0: [0, 0.78],
  1: [0, 0.3],
  2: [0.24, 0.56],
  3: [0.5, 0.78],
};

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Progress of one cell inside the decide scrub. Mirrors the GLSL version. */
export function decisionProgress(decide: number, decision: Decision, delay: number) {
  const [a, b] = WINDOWS[decision];
  const local = (decide - a) / (b - a);
  return smooth(0, 1, (local - delay * 0.6) / 0.4);
}

export function createField(cols: number, rows: number, seed = 20261019): FieldModel {
  const rnd = mulberry32(seed);
  const spacing = 1;
  const count = cols * rows;
  const width = (cols - 1) * spacing;
  const depth = (rows - 1) * spacing;
  const pos = new Float32Array(count * 2);
  const stock0 = new Float32Array(count);
  const stock1 = new Float32Array(count);
  const lo = new Float32Array(count);
  const hi = new Float32Array(count);
  const decision = new Float32Array(count);
  const delay = new Float32Array(count);
  const seeds = new Float32Array(count);
  const flags = new Float32Array(count);

  // Normalised grid space u, v in [0, 1]. Features are placed in this space so
  // every grid size (desktop, tablet, phone) tells the same story.
  const cities = [
    { u: 0.22, v: 0.4, a: 1.5, s: 0.13 },
    { u: 0.5, v: 0.62, a: 1.9, s: 0.12 },
    { u: 0.74, v: 0.32, a: 1.3, s: 0.15 },
    { u: 0.86, v: 0.72, a: 1.1, s: 0.1 },
    { u: 0.36, v: 0.82, a: 0.9, s: 0.1 },
  ];
  const surplus = [
    { u: 0.6, v: 0.54, s: 0.055, m: 3.1 }, // beside a stockout: problem 5
    { u: 0.12, v: 0.78, s: 0.07, m: 2.7 }, // dead stock far from demand: problem 1
    { u: 0.9, v: 0.14, s: 0.06, m: 2.5 },
  ];
  const shortage = [
    { u: 0.49, v: 0.6, s: 0.06 }, // best-seller pit in the biggest city: problem 0
    { u: 0.66, v: 0.5, s: 0.035 }, // neighbour of the surplus tower: problem 5
    { u: 0.24, v: 0.38, s: 0.05 },
    { u: 0.78, v: 0.36, s: 0.04 },
  ];
  const sheet = { u0: 0.3, u1: 0.42, v0: 0.12, v1: 0.3 }; // problem 2
  const newRow = Math.max(1, Math.round(rows * 0.06)); // problem 3: front rows near x end
  const newCols = { u0: 0.62, u1: 0.84 };

  const g = (du: number, dv: number, s: number) => Math.exp(-(du * du + dv * dv) / (2 * s * s));

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const u = cols > 1 ? i / (cols - 1) : 0.5;
      const v = rows > 1 ? j / (rows - 1) : 0.5;
      pos[k * 2] = i * spacing - width / 2;
      pos[k * 2 + 1] = j * spacing - depth / 2;
      seeds[k] = rnd();

      // Demand: a floor plus city blobs plus gentle variation.
      let demand = 0.55 + 0.18 * Math.sin(u * 9.1 + v * 3.7) * Math.cos(v * 7.3 - u * 2.1);
      for (const c of cities) demand += c.a * g(u - c.u, v - c.v, c.s);
      demand = Math.max(0.35, demand) * (0.88 + rnd() * 0.24);

      // Mismatch: how far the old plan is from demand. Coherent patches, not noise.
      const drift =
        (Math.sin(u * 7.1 + 1.3) * Math.cos(v * 5.3 - 0.7) + 0.6 * Math.sin(u * 13.7 - v * 9.1 + 2.1) + 0.35 * Math.cos(u * 21.3 + v * 17.9)) / 1.95;
      let m = 1 + 0.46 * drift + (rnd() - 0.5) * 0.34;
      for (const s of surplus) m = Math.max(m, 1 + (s.m - 1) * g(u - s.u, v - s.v, s.s));
      for (const s of shortage) m *= 1 - 0.97 * g(u - s.u, v - s.v, s.s);

      let s0 = demand * m;
      const inSheet = u >= sheet.u0 && u <= sheet.u1 && v >= sheet.v0 && v <= sheet.v1;
      if (inSheet) {
        s0 = 1.15; // one number, copied down the column
        flags[k] = FLAG_SHEET;
      }
      const isNew = j >= rows - newRow && u >= newCols.u0 && u <= newCols.u1;
      if (isNew) {
        s0 = 0;
        flags[k] = FLAG_NEW;
      }

      const target = demand * (0.98 + rnd() * 0.08) * HEIGHT;
      stock0[k] = Math.min(6.4, s0) * HEIGHT;
      stock1[k] = target;
      const spread = target * (0.14 + 0.16 * seeds[k]) + (isNew ? target * 0.18 : 0);
      lo[k] = Math.max(0.05, target - spread);
      hi[k] = target + spread;
    }
  }

  // Classify and pair: shortages take from nearby surplus first (transfer),
  // otherwise they are ordered. Leftover surplus is marked down.
  const ratio = (k: number) => stock0[k] / Math.max(stock1[k], 0.05);
  const shortages: number[] = [];
  const surpluses: number[] = [];
  for (let k = 0; k < count; k++) {
    const r = ratio(k);
    if (r < 0.5) shortages.push(k);
    else if (r > 1.65) surpluses.push(k);
  }
  const spare = new Float32Array(count);
  for (const k of surpluses) spare[k] = stock0[k] - stock1[k];
  const dist = (a: number, b: number) => Math.hypot(pos[a * 2] - pos[b * 2], pos[a * 2 + 1] - pos[b * 2 + 1]);
  const radius = Math.max(4, cols * 0.16);
  const pairs: [number, number, number][] = [];
  for (const k of shortages) {
    const need = stock1[k] - stock0[k];
    let best = -1;
    let bestD = Infinity;
    if (!(flags[k] & FLAG_NEW)) {
      for (const s of surpluses) {
        if (spare[s] < need * 0.6) continue;
        const d = dist(k, s);
        if (d < radius && d < bestD) {
          best = s;
          bestD = d;
        }
      }
    }
    if (best >= 0) {
      spare[best] -= need;
      decision[k] = 2;
      decision[best] = 2;
      pairs.push([best, k, need]);
    } else {
      decision[k] = 1;
    }
  }
  for (const k of surpluses) if (decision[k] !== 2) decision[k] = 3;
  // A transfer source keeps its decision even when other sources supplied the rest.

  // Stagger: decisions sweep across the field from left to right.
  for (let k = 0; k < count; k++) {
    const u = (pos[k * 2] + width / 2) / Math.max(width, 1);
    delay[k] = Math.min(1, u * 0.78 + rnd() * 0.22);
  }

  // Travellers: cartons that physically move.
  const maxTravellers = Math.round(Math.min(180, Math.max(48, count * 0.12)));
  const tFrom: number[] = [];
  const tTo: number[] = [];
  const tKind: number[] = [];
  const tDelay: number[] = [];
  const pushT = (from: number[], to: number[], kind: number, d: number) => {
    tFrom.push(...from);
    tTo.push(...to);
    tKind.push(kind);
    tDelay.push(d);
  };
  const transferBudget = Math.round(maxTravellers * 0.6);
  pairs
    .slice()
    .sort((a, b) => b[2] - a[2])
    .slice(0, transferBudget)
    .forEach(([s, t]) => {
      const cartons = 1 + Math.round(rnd());
      for (let n = 0; n < cartons; n++) {
        pushT(
          [pos[s * 2], stock0[s] * (0.55 + 0.3 * rnd()), pos[s * 2 + 1]],
          [pos[t * 2], Math.max(0.2, stock1[t] * 0.6), pos[t * 2 + 1]],
          0,
          Math.min(1, delay[t] * 0.85 + n * 0.08),
        );
      }
    });
  const orders = shortages.filter(k => decision[k] === 1);
  const orderBudget = maxTravellers - tKind.length;
  for (let n = 0; n < orders.length && n < orderBudget; n++) {
    const k = orders[Math.floor((n * orders.length) / Math.min(orders.length, orderBudget))];
    pushT([pos[k * 2], 11, pos[k * 2 + 1]], [pos[k * 2], Math.max(0.2, stock1[k] * 0.6), pos[k * 2 + 1]], 1, delay[k]);
  }

  // Foci for the six problems, measured from the generated field.
  const centroid = (pred: (k: number) => boolean, fallback: { u: number; v: number }) => {
    let x = 0;
    let z = 0;
    let n = 0;
    for (let k = 0; k < count; k++)
      if (pred(k)) {
        x += pos[k * 2];
        z += pos[k * 2 + 1];
        n++;
      }
    return n
      ? { x: x / n, z: z / n }
      : { x: fallback.u * width - width / 2, z: fallback.v * depth - depth / 2 };
  };
  const near = (cu: number, cv: number, r: number) => (k: number) => {
    const u = (pos[k * 2] + width / 2) / Math.max(width, 1);
    const v = (pos[k * 2 + 1] + depth / 2) / Math.max(depth, 1);
    return Math.hypot(u - cu, v - cv) < r;
  };
  const r = Math.max(3.2, cols * 0.1);
  const pit = centroid(k => ratio(k) < 0.5 && near(0.49, 0.6, 0.12)(k), shortage[0]);
  const dead = centroid(k => decision[k] === 3 && near(0.12, 0.78, 0.15)(k), surplus[1]);
  const sheetC = centroid(k => !!(flags[k] & FLAG_SHEET), { u: 0.36, v: 0.21 });
  const newC = centroid(k => !!(flags[k] & FLAG_NEW), { u: 0.73, v: 0.97 });
  const signalOrigins = [
    { x: -width / 2 - 2, z: -depth * 0.2 },
    { x: width * 0.15, z: -depth / 2 - 2 },
    { x: width / 2 + 2, z: depth * 0.1 },
  ];

  // Featured transfer: the largest pair near the surplus tower beside a pit.
  let feature = { from: 0, to: 0, units: 0 };
  let bestScore = -Infinity;
  for (const [s, t, need] of pairs) {
    const u = (pos[s * 2] + width / 2) / Math.max(width, 1);
    const v = (pos[s * 2 + 1] + depth / 2) / Math.max(depth, 1);
    const score = need - Math.hypot(u - 0.6, v - 0.54) * 8;
    if (score > bestScore) {
      bestScore = score;
      feature = { from: s, to: t, units: 360 };
    }
  }
  const wrong = {
    x: (pos[feature.from * 2] + pos[feature.to * 2]) / 2,
    z: (pos[feature.from * 2 + 1] + pos[feature.to * 2 + 1]) / 2,
  };

  const foci: Focus[] = [
    { ...pit, r },
    { ...dead, r: r * 1.1 },
    { ...sheetC, r: r * 0.9 },
    { ...newC, r: r * 0.9 },
    { x: signalOrigins[0].x + 4, z: signalOrigins[0].z, r: r * 1.6 },
    { ...wrong, r: r * 0.85 },
  ];

  const n = tKind.length;
  return {
    cols,
    rows,
    count,
    spacing,
    width,
    depth,
    pos,
    stock0,
    stock1,
    lo,
    hi,
    decision,
    delay,
    seed: seeds,
    flags,
    travellers: {
      count: n,
      from: new Float32Array(tFrom),
      to: new Float32Array(tTo),
      kind: new Float32Array(tKind),
      delay: new Float32Array(tDelay),
    },
    foci,
    feature,
    signalOrigins,
  };
}
