import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { buildCampus } from './models';
import type { TimelineState } from './timeline';

/**
 * Warehouse operations around the story: people at work, two robots, the dock forklift, cartons on the
 * conveyor, road traffic in the wide shots, a status light on every rack and the SANKET screen on the
 * wall. Every position is a pure function of time and the story state, so scrubbing back and forth
 * and reduced motion (time held at 0) always show the same frame.
 */
type Model = Awaited<ReturnType<typeof buildCampus>>;
type V2 = [number, number];
type Pose = 'walk' | 'idle' | 'reach' | 'carry' | 'place' | 'scan' | 'tablet' | 'search' | 'wave' | 'type';
const TAU = Math.PI * 2;
const ease = (k: number) => k * k * (3 - 2 * k);
const turn = (a: number, b: number, k: number) => a + ((((b - a + Math.PI) % TAU) + TAU) % TAU - Math.PI) * k;

interface Seg { to?: V2[]; dur: number; rev?: boolean; yaw?: number; fork?: [number, number]; carry?: boolean; pose?: Pose; linear?: boolean }
export interface Sample { x: number; z: number; yaw: number; fork: number; carry: boolean; moving: boolean; dist: number; pose: Pose; k: number }

/** A looping (or scrubbed) route: moves along curves, turns in place, holds, raises forks. */
export function route(start: V2, startYaw: number, segs: Seg[]) {
  let pos = start, yaw = startYaw, t = 0, dist = 0, fork = 0;
  const steps = segs.map(s => {
    const step = { ...s, t0: t, p0: pos, y0: yaw, d0: dist, f0: s.fork?.[0] ?? fork, f1: s.fork?.[1] ?? fork, curve: null as T.Curve<T.Vector3> | null, len: 0, y1: yaw };
    if (s.to) {
      const pts = [pos, ...s.to].map(([x, z]) => new T.Vector3(x, 0, z));
      step.curve = pts.length > 2 ? new T.CatmullRomCurve3(pts, false, 'centripetal') : new T.LineCurve3(pts[0], pts[1]);
      step.len = step.curve.getLength(); dist += step.len; pos = s.to[s.to.length - 1];
      const tangent = step.curve.getTangentAt(1); yaw = Math.atan2(tangent.x, tangent.z) + (s.rev ? Math.PI : 0);
    } else if (s.yaw !== undefined) yaw = s.yaw;
    step.y1 = yaw; fork = step.f1; t += s.dur;
    return step;
  });
  const total = t, point = new T.Vector3(), tangent = new T.Vector3();
  const sample = (time: number, loop = true): Sample => {
    const tt = loop ? ((time % total) + total) % total : Math.min(total, Math.max(0, time));
    let s = steps[steps.length - 1];
    for (const step of steps) if (tt < step.t0 + step.dur) { s = step; break; }
    const k = Math.min(1, Math.max(0, (tt - s.t0) / s.dur)), e = s.linear ? k : ease(k);
    let x: number, z: number, heading: number;
    if (s.curve) {
      s.curve.getPointAt(e, point); s.curve.getTangentAt(Math.min(.999, Math.max(.001, e)), tangent);
      x = point.x; z = point.z; heading = Math.atan2(tangent.x, tangent.z) + (s.rev ? Math.PI : 0);
    } else { x = s.p0[0]; z = s.p0[1]; heading = s.yaw !== undefined ? turn(s.y0, s.y1, e) : s.y0; }
    return { x, z, yaw: heading, fork: s.f0 + (s.f1 - s.f0) * e, carry: !!s.carry, moving: !!s.curve && k > 0 && k < 1, dist: s.d0 + s.len * e, pose: s.pose ?? (s.curve ? 'walk' : 'idle'), k };
  };
  return { sample, total };
}

// ---------- The story forklift: pick the A3 pallet from the middle level, carry it to dock 02, load it ----------
/** Progress `u` is the scrolled pick (state.pallet), from the parking spot deep in the aisle to the dock. */
const pick = route([4.5, -4.9], 0, [
  { to: [[4.45, -3.4], [4.0, -2.0]], dur: .14 },
  { yaw: Math.PI / 2, dur: .07 },
  { fork: [0, 1.42], dur: .09 },
  { to: [[5.0, -2.0]], dur: .06 },
  { fork: [1.42, 1.52], dur: .04, carry: true },
  { to: [[4.0, -2.0]], rev: true, dur: .07, carry: true },
  // Turn while still raised (clear of the lower pallets), then lower to travel height.
  { yaw: 0, dur: .08, carry: true },
  { fork: [1.52, .15], dur: .08, carry: true },
  { to: [[4.0, -1.2], [4.4, 0], [4.5, 1.6], [4.05, 3.1], [2.75, 3.55], [1.75, 4.05], [1.42, 4.6], [1.4, 4.9]], dur: .37, carry: true },
]);
/** Progress `l` is the scrolled loading (state.loading): into the trailer, set down, back out. */
const load = route([1.4, 4.9], 0, [
  { fork: [.15, .38], dur: .15, carry: true },
  { to: [[1.4, 7.6]], dur: .4, carry: true },
  { fork: [.38, .28], dur: .08, carry: true },
  { to: [[1.4, 4.4]], rev: true, fork: [.28, .12], dur: .37 },
]);
/** Where the story forklift and its pallet are for a scrolled pick and loading (pure; tested in check-campus). */
export function storyLift(u: number, l: number) {
  const s = l > 0 ? load.sample(l, false) : pick.sample(u, false);
  return { lift: s, attached: s.carry, picked: u >= .36 || l > 0 };
}
const PALLET_REACH = 1.6, FORK_TOP = .735;

// ---------- People ----------
interface Person { plan?: ReturnType<typeof route>; at?: [number, number, number]; floor: number; offset?: number; vest: string; legs: string; skin: string; hat: string | null; hair?: boolean; seated?: boolean; pose?: Pose }
const VEST = '#cfd34e', WHITE_HAT = '#e9e6dc', ORANGE_HAT = '#e65717';
const people: Record<string, Person> = {
  // Picks the fast seller (A2) and drops it on the trolley at the aisle mouth.
  pickerA: { floor: .5, vest: VEST, legs: '#2b3036', skin: '#a8764f', hat: WHITE_HAT, plan: route([.3, 2.75], Math.PI, [
    { to: [[.3, -3.75]], dur: 7, linear: true }, { yaw: Math.PI / 2, dur: .6 }, { pose: 'reach', dur: 2.2 },
    { yaw: 0, dur: .6, pose: 'carry' }, { to: [[.3, 2.75]], dur: 7, linear: true, pose: 'carry' }, { pose: 'place', dur: 1.6 }, { yaw: Math.PI, dur: .6 },
  ]) },
  // After A2 runs out the same picker can only fill orders from A1, across the aisle.
  pickerA1: { floor: .5, vest: VEST, legs: '#2b3036', skin: '#a8764f', hat: WHITE_HAT, plan: route([.3, 2.75], Math.PI, [
    { to: [[.3, -2.0]], dur: 5.4, linear: true }, { yaw: -Math.PI / 2, dur: .6 }, { pose: 'reach', dur: 2.2 },
    { yaw: 0, dur: .6, pose: 'carry' }, { to: [[.3, 2.75]], dur: 5.4, linear: true, pose: 'carry' }, { pose: 'place', dur: 1.6 }, { yaw: Math.PI, dur: .6 },
  ]) },
  pickerB: { floor: .5, vest: VEST, legs: '#3b3a35', skin: '#d6ae8b', hat: ORANGE_HAT, plan: route([4.5, 2.9], Math.PI, [
    { to: [[4.5, -2.0]], dur: 5.2, linear: true }, { yaw: Math.PI / 2, dur: .6 }, { pose: 'scan', dur: 2.6 },
    { yaw: 0, dur: .6 }, { to: [[4.5, 2.9]], dur: 5.2, linear: true }, { pose: 'idle', dur: 2 }, { yaw: Math.PI, dur: .6 },
  ]) },
  packerIn: { floor: .5, vest: VEST, legs: '#24282c', skin: '#8a5a3c', hat: WHITE_HAT, at: [.65, -5.65, Math.PI], pose: 'place' },
  packerOut: { floor: .5, vest: '#c9c2b2', legs: '#24282c', skin: '#c99a74', hat: null, hair: true, at: [8.35, -5.55, 2.4], pose: 'scan' },
  dock02: { floor: .5, vest: VEST, legs: '#2b3036', skin: '#c99a74', hat: WHITE_HAT, at: [3.0, 5.3, -Math.PI / 2], pose: 'scan' },
  dock04: { floor: .5, vest: VEST, legs: '#3b3a35', skin: '#8a5a3c', hat: WHITE_HAT, at: [7.05, 5.6, Math.PI / 2], pose: 'scan' },
  driver: { floor: .23, vest: '#4f6b5b', legs: '#24282c', skin: '#a8764f', hat: null, hair: true, at: [2.85, 11.1, -Math.PI / 2], pose: 'idle' },
  walkerA: { floor: .23, vest: '#6d8a9e', legs: '#2b3036', skin: '#d6ae8b', hat: null, hair: true, plan: route([-10.6, 7.6], Math.PI / 2, [
    { to: [[-5.6, 7.6]], dur: 5.4, linear: true }, { yaw: -Math.PI / 2, dur: .8 }, { to: [[-10.6, 7.6]], dur: 5.4, linear: true }, { yaw: Math.PI / 2, dur: .8 },
  ]) },
  walkerB: { offset: 6.2, floor: .23, vest: '#8a6f5a', legs: '#3b3a35', skin: '#8a5a3c', hat: null, hair: true, plan: route([-5.9, 7.75], -Math.PI / 2, [
    { to: [[-10.2, 7.75]], dur: 4.8, linear: true }, { pose: 'idle', dur: 1.4 }, { yaw: Math.PI / 2, dur: .8 }, { to: [[-5.9, 7.75]], dur: 4.8, linear: true }, { yaw: -Math.PI / 2, dur: .8 },
  ]) },
  officeA: { floor: .49, vest: '#6d8a9e', legs: '#2b3036', skin: '#c99a74', hat: null, hair: true, seated: true, at: [-10, 6.05, 0], pose: 'type' },
  officeB: { floor: .49, vest: '#c9c2b2', legs: '#24282c', skin: '#8a5a3c', hat: null, hair: true, seated: true, at: [-6.8, 6.05, 0], pose: 'type' },
  officeC: { floor: 2.74, vest: '#4f6b5b', legs: '#3b3a35', skin: '#d6ae8b', hat: null, hair: true, seated: true, at: [-8.4, 6.05, 0], pose: 'type' },
  officeD: { floor: 2.74, vest: '#8a6f5a', legs: '#24282c', skin: '#a8764f', hat: null, hair: true, seated: true, at: [-6.8, 6.05, 0], pose: 'type' },
};
// pickerA and pickerA1 are one person on two routines.
const CAST = Object.keys(people).filter(k => k !== 'pickerA1');

// ---------- Robots, the dock forklift and the conveyor ----------
const robotPlans = [
  route([12.7, 2.4], Math.PI, [{ to: [[12.7, -5.2]], dur: 8 }, { yaw: 0, dur: 1.4 }, { dur: 1.5 }, { to: [[12.7, 2.4]], dur: 8 }, { yaw: Math.PI, dur: 1.4 }, { dur: 2 }]),
  route([8.7, 1.9], Math.PI, [{ to: [[8.7, -4.4]], dur: 6.5 }, { yaw: 0, dur: 1.4 }, { dur: 1.6 }, { to: [[8.7, 1.9]], dur: 6.5 }, { yaw: Math.PI, dur: 1.4 }, { dur: 3 }]),
];
const dockLiftPlan = route([9.7, 5.1], Math.PI / 2, [
  { to: [[10.3, 5.1]], dur: 1.4, fork: [.12, .12] },
  { fork: [.12, .3], dur: 1, carry: true },
  { to: [[9.7, 5.08], [9.0, 4.7], [8.65, 4.1], [8.6, 3.6]], rev: true, dur: 4.2, carry: true },
  { to: [[8.6, 7.5]], fork: [.3, .42], dur: 4.2, carry: true },
  { fork: [.42, .3], dur: .9, carry: true },
  { to: [[8.6, 3.6]], rev: true, fork: [.3, .12], dur: 4 },
  { to: [[8.65, 4.1], [9.0, 4.7], [9.35, 5.05], [9.7, 5.1]], dur: 4 },
  { dur: 2 },
]);
const CONVEYOR = { from: 1.0, to: 9.0, z: -6.4, y: 1.31, speed: .45, count: 9 };
const ROAD = new T.CatmullRomCurve3([[-16, .28, 16.2], [14, .28, 16.2], [19.2, .28, 12], [19.2, .28, -12], [14, .28, -16.3], [-14, .28, -16.3], [-19.2, .28, -12], [-19.2, .28, 12]].map(p => new T.Vector3(...p as [number, number, number])), true, 'centripetal');

// ---------- The SANKET screen: the same plan the story explains, as the team sees it ----------
type Screen = 'stock' | 'gap' | 'out' | 'slow' | 'connect' | 'forecast' | 'order' | 'transfer' | 'markdown' | 'approve' | 'track1' | 'track2' | 'track3' | 'track4';
export function screenFor(s: TimelineState): Screen {
  if (s.label === 'problem') return (['gap', 'out', 'slow'] as const)[s.problemStep];
  if (s.label === 'forecast') return (['connect', 'forecast', 'order', 'transfer', 'markdown'] as const)[s.solutionStep];
  if (s.label === 'decision') return s.step === 0 ? 'approve' : (`track${s.step}` as Screen);
  return 'stock';
}
const C = { bg: '#0c120e', line: '#24302a', text: '#e9ece2', dim: '#8f9b88', orange: '#ff7a3d', red: '#ff4d2e', mint: '#a8e6ce', amber: '#f3bd73', cream: '#d9dccf' };
function drawScreen(ctx: CanvasRenderingContext2D, mode: Screen) {
  const W = 512, H = 288, font = (w: number, px: number, mono = false) => `${w} ${px}px ${mono ? '"IBM Plex Mono", Consolas, monospace' : 'Archivo, Arial, sans-serif'}`;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#121a15'; ctx.fillRect(0, 0, W, 40);
  ctx.fillStyle = C.orange; [0, 1, 2].forEach(i => ctx.fillRect(18 + i * 6, 26 - i * 4, 4, 6 + i * 4));
  ctx.fillStyle = C.text; ctx.font = font(700, 18); ctx.textBaseline = 'middle'; ctx.fillText('SANKET', 44, 21);
  ctx.fillStyle = C.mint; ctx.beginPath(); ctx.arc(W - 64, 20, 4, 0, TAU); ctx.fill();
  ctx.font = font(500, 12, true); ctx.fillText('LIVE', W - 54, 21);
  const rows: [string, number, string, string][] = [['A1', 32, C.cream, '32d'], ['A2', mode === 'stock' || mode === 'gap' ? 9 : 0, C.orange, mode === 'stock' || mode === 'gap' ? '9d' : '0'], ['A3', 64, C.mint, '64d'], ['A4', 120, C.amber, '120d']];
  const big = (label: string, value: string, color: string, note: string) => {
    ctx.fillStyle = C.dim; ctx.font = font(500, 15, true); ctx.fillText(label, 34, 82);
    ctx.fillStyle = color; ctx.font = font(700, 92); ctx.fillText(value, 30, 158);
    ctx.fillStyle = C.text; ctx.font = font(500, 18); ctx.fillText(note, 34, 232);
  };
  const tick = (x: number, y: number, color: string) => { ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 9, y + 9); ctx.lineTo(x + 26, y - 10); ctx.stroke(); };
  if (mode === 'stock' || mode === 'slow') {
    rows.forEach(([id, days, color, label], i) => {
      const y = 70 + i * 52, focus = mode === 'slow' ? id === 'A4' : id === 'A2';
      ctx.fillStyle = focus ? '#1b241e' : C.bg; ctx.fillRect(16, y - 20, W - 32, 44);
      ctx.fillStyle = C.text; ctx.font = font(600, 18, true); ctx.fillText(id, 30, y + 2);
      ctx.fillStyle = C.line; ctx.fillRect(84, y - 4, 300, 12);
      ctx.fillStyle = color; ctx.fillRect(84, y - 4, Math.max(4, 300 * Math.min(1, days / 120)), 12);
      ctx.fillStyle = focus ? color : C.dim; ctx.font = font(600, 17, true); ctx.fillText(label, 404, y + 2);
    });
    if (mode === 'stock') { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.moveTo(466, 108); ctx.lineTo(480, 132); ctx.lineTo(452, 132); ctx.fill(); }
  } else if (mode === 'gap') {
    ctx.fillStyle = C.dim; ctx.font = font(500, 15, true); ctx.fillText('A2', 34, 82);
    ctx.fillStyle = C.text; ctx.font = font(700, 54); ctx.fillText('9d', 30, 136);
    ctx.fillStyle = C.dim; ctx.font = font(500, 22); ctx.fillText('/', 116, 136); ctx.fillStyle = C.mint; ctx.font = font(700, 54); ctx.fillText('14d', 142, 136);
    ctx.fillStyle = C.line; ctx.fillRect(34, 190, 444, 18);
    ctx.fillStyle = C.orange; ctx.fillRect(34, 190, 444 * 9 / 14, 18);
    ctx.fillStyle = C.red; for (let x = 34 + 444 * 9 / 14; x < 478; x += 12) ctx.fillRect(x, 190, 6, 18);
    ctx.fillStyle = C.red; ctx.font = font(700, 26); ctx.fillText('−5d', 380, 246);
  } else if (mode === 'out') {
    big('A2', '0', C.red, 'DEMAND 75');
    ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.strokeRect(300, 96, 178, 64); ctx.fillStyle = C.red; ctx.font = font(800, 30); ctx.fillText('OUT', 352, 129);
  } else if (mode === 'connect') {
    ['ERP', 'POS', 'SUPPLIER'].forEach((label, i) => {
      const y = 86 + i * 62; ctx.strokeStyle = C.mint; ctx.lineWidth = 2; ctx.strokeRect(30, y - 22, 150, 44);
      ctx.fillStyle = C.text; ctx.font = font(600, 16, true); ctx.fillText(label, 46, y + 1);
      ctx.beginPath(); ctx.setLineDash([6, 6]); ctx.moveTo(182, y); ctx.lineTo(320, 148); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.fillStyle = '#16261e'; ctx.fillRect(320, 112, 160, 72); ctx.strokeStyle = C.mint; ctx.strokeRect(320, 112, 160, 72);
    ctx.fillStyle = C.mint; ctx.font = font(700, 22); ctx.fillText('SANKET', 352, 149);
  } else if (mode === 'forecast') {
    ctx.fillStyle = C.dim; ctx.font = font(500, 15, true); ctx.fillText('A2 · 4W', 34, 70);
    const pts = [[40, 210], [120, 188], [200, 196], [280, 150], [360, 128], [460, 96]];
    ctx.fillStyle = '#a8e6ce33'; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 26) : ctx.moveTo(x, y - 26))); [...pts].reverse().forEach(([x, y]) => ctx.lineTo(x, y + 26)); ctx.fill();
    ctx.strokeStyle = C.mint; ctx.lineWidth = 4; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.fillStyle = C.text; ctx.font = font(700, 30); ctx.fillText('1,200', 360, 250);
  } else if (mode === 'order') {
    big('A2 · ORDER', '800', C.mint, '1,200 + 200 − 400 − 200');
    tick(410, 120, C.mint);
  } else if (mode === 'transfer' || mode === 'approve' || mode.startsWith('track')) {
    ctx.fillStyle = C.dim; ctx.font = font(500, 15, true); ctx.fillText('A3 → WEST', 34, 76);
    ctx.fillStyle = C.mint; ctx.font = font(700, 76); ctx.fillText('360', 30, 140);
    const step = mode === 'transfer' ? -1 : mode === 'approve' ? 0 : Number(mode.slice(5));
    if (step >= 0) {
      for (let i = 0; i < 5; i++) {
        const x = 50 + i * 102;
        ctx.fillStyle = i < step ? C.mint : i === step ? C.orange : C.line;
        ctx.beginPath(); ctx.arc(x, 222, i === step ? 13 : 9, 0, TAU); ctx.fill();
        if (i < 4) { ctx.fillStyle = i < step ? C.mint : C.line; ctx.fillRect(x + 14, 220, 74, 4); }
      }
      if (step === 0) tick(300, 110, C.mint);
    } else { ctx.strokeStyle = C.mint; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(40, 222); ctx.lineTo(470, 222); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = C.mint; ctx.fillRect(250, 210, 24, 24); }
  } else if (mode === 'markdown') {
    big('A4 · WK 8', '−12%', C.amber, '120d → 75d');
  }
}

export function createLife(model: Model) {
  const group = new T.Group();
  const dummy = new T.Object3D(), color = new T.Color();
  // One instanced batch per body part for everyone; per-instance colours carry vests, skin and hats.
  const plain = () => new T.MeshStandardMaterial({ color: '#ffffff', roughness: .82 });
  const parts = {
    leg: new T.InstancedMesh(new T.BoxGeometry(.13, .8, .15).translate(0, -.4, 0), plain(), CAST.length * 2),
    arm: new T.InstancedMesh(new T.BoxGeometry(.09, .6, .1).translate(0, -.29, 0), plain(), CAST.length * 2),
    torso: new T.InstancedMesh(new RoundedBoxGeometry(.38, .6, .23, 2, .06), plain(), CAST.length),
    head: new T.InstancedMesh(new T.IcosahedronGeometry(.115, 1), plain(), CAST.length),
    hat: new T.InstancedMesh(new T.CylinderGeometry(.12, .14, .085, 10), plain(), CAST.length),
    load: new T.InstancedMesh(new RoundedBoxGeometry(.36, .26, .3, 1, .03), model.materials.carton, CAST.length),
    tablet: new T.InstancedMesh(new T.BoxGeometry(.28, .19, .02), model.materials.mintLight, CAST.length),
  };
  for (const mesh of Object.values(parts)) { mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; group.add(mesh); }
  CAST.forEach((name, i) => {
    const p = people[name];
    parts.torso.setColorAt(i, color.set(p.vest));
    for (const side of [0, 1]) { parts.leg.setColorAt(i * 2 + side, color.set(p.legs)); parts.arm.setColorAt(i * 2 + side, color.set(p.vest)); }
    parts.head.setColorAt(i, color.set(p.skin));
    parts.hat.setColorAt(i, color.set(p.hat ?? '#2a211b'));
  });
  // A small rig, reused for every person: pivots at hips, shoulders and neck.
  const rig = new T.Object3D(), body = new T.Object3D(); rig.add(body);
  const joint = (x: number, y: number, z: number, parent = body) => { const o = new T.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const hipL = joint(-.095, .82, 0), hipR = joint(.095, .82, 0), torso = joint(0, 1.12, 0);
  const shoulderL = joint(-.24, 1.38, 0), shoulderR = joint(.24, 1.38, 0), neck = joint(0, 1.5, 0);
  const head = joint(0, .07, 0, neck), hat = joint(0, .16, 0, neck), load = joint(0, 1.08, .3), tablet = joint(0, 1.16, .3);
  const zero = new T.Matrix4().makeScale(0, 0, 0);
  const put = (mesh: T.InstancedMesh, index: number, node: T.Object3D | null) => mesh.setMatrixAt(index, node ? node.matrixWorld : zero);

  function pose(i: number, p: Person, x: number, z: number, yaw: number, kind: Pose, dist: number, moving: boolean, time: number, visible: boolean) {
    rig.position.set(x, p.floor, z); rig.rotation.set(0, yaw, 0); rig.scale.setScalar(visible ? 1 : 0);
    // The stride follows distance walked, so feet never slide; standing poses keep the legs together.
    const swing = moving ? Math.sin(dist / .62 * Math.PI) : 0, life = time + i * 1.7;
    let legL = swing * .5, legR = -swing * .5, armL = -swing * .4, armR = swing * .4, outL = -.06, outR = .06, headX = 0, headY = 0, lift = Math.abs(swing) * .03;
    if (p.seated) { legL = legR = -1.5; lift = -.36; armL = armR = -1.15 + Math.sin(life * 9) * .05; headX = .2; }
    else if (kind === 'reach') { const r = Math.sin(Math.min(1, (life % 2.2) / 1.1) * Math.PI); armR = -2.5 * r - .3; armL = -.9 * r; headX = -.25 * r; }
    else if (kind === 'carry') { armL = armR = -1.05; outL = .12; outR = -.12; }
    else if (kind === 'place') { const k = (Math.sin(life * 4.4) + 1) / 2; armL = armR = -.7 - .5 * k; headX = .3; lift = -.04 * k; }
    else if (kind === 'scan') { armR = -1.25; armL = -.25; headX = .25 + Math.sin(life * 1.3) * .08; headY = Math.sin(life * .7) * .3; }
    else if (kind === 'tablet') { armL = armR = -1.0; outL = .22; outR = -.22; headX = .38; }
    else if (kind === 'search') { outL = -.45; outR = .45; armL = armR = -.2; headY = Math.sin(life * 1.1) * .6; headX = -.18; }
    else if (kind === 'wave') { armR = -2.8; outR = .25 + Math.sin(life * 5) * .35; headX = -.05; }
    else if (kind === 'idle') { headY = Math.sin(life * .5) * .25; lift = Math.sin(life * 1.6) * .006; }
    body.position.y = lift;
    hipL.rotation.set(legL, 0, 0); hipR.rotation.set(legR, 0, 0);
    shoulderL.rotation.set(armL, 0, outL); shoulderR.rotation.set(armR, 0, outR);
    neck.rotation.set(headX, headY, 0);
    // Office staff wear no hardhat: the same part, flattened, reads as hair.
    if (p.hair) { hat.scale.set(1, .7, 1); hat.position.y = .12; } else { hat.scale.set(1, 1, 1); hat.position.y = .16; }
    rig.updateMatrixWorld(true);
    put(parts.leg, i * 2, hipL); put(parts.leg, i * 2 + 1, hipR); put(parts.arm, i * 2, shoulderL); put(parts.arm, i * 2 + 1, shoulderR);
    put(parts.torso, i, torso); put(parts.head, i, head); put(parts.hat, i, hat);
    put(parts.load, i, visible && kind === 'carry' ? load : null);
    put(parts.tablet, i, visible && kind === 'tablet' ? tablet : null);
  }

  // Conveyor cartons ride into the packing machine.
  const cartons = new T.InstancedMesh(new RoundedBoxGeometry(.42, .3, .36, 1, .03), model.materials.carton, CONVEYOR.count);
  cartons.castShadow = cartons.receiveShadow = true; cartons.frustumCulled = false; group.add(cartons);

  // Rack status lights next to each rack sign: what the plan says about that product right now.
  // One batch; the material's colour above 1 lets bloom catch them on the high tier.
  const lamps = new T.InstancedMesh(new RoundedBoxGeometry(.16, .16, .06, 1, .02), new T.MeshBasicMaterial({ color: new T.Color(1.7, 1.7, 1.7) }), 4);
  [-1.8, 2.4, 6.6, 10.8].forEach((x, i) => { dummy.position.set(x + .72, 4.94, 2.5); dummy.updateMatrix(); lamps.setMatrixAt(i, dummy.matrix); lamps.setColorAt(i, color.set('#fff')); });
  group.add(lamps);

  // The wall screen inside the west wall, facing the floor and the camera.
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 288;
  const ctx = canvas.getContext('2d')!;
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 4;
  const screen = new T.Mesh(new T.PlaneGeometry(3.4, 1.91), new T.MeshBasicMaterial({ map: texture }));
  screen.position.set(-3.84, 3.35, 3.9); screen.rotation.y = Math.PI / 2; group.add(screen);
  const bezel = new T.Mesh(new RoundedBoxGeometry(3.6, 2.1, .08, 1, .03), model.materials.dark); bezel.position.set(-3.88, 3.35, 3.9); bezel.rotation.y = Math.PI / 2; group.add(bezel);
  let shown: Screen | '' = '';

  const forward = (yaw: number) => [Math.sin(yaw), Math.cos(yaw)] as const;
  const carriage = (lift: T.Object3D) => lift.userData.carriage as T.Group;
  const tangent = new T.Vector3();

  return {
    group,
    /**
     * `time` runs while motion is allowed (held at 0 otherwise); `ambient` is the wide shots' clock for
     * road traffic. The story forklift follows the scrolled state only.
     */
    update(time: number, ambient: number, state: TimelineState) {
      // People.
      const stockout = state.label === 'problem' && state.problemStep === 1;
      CAST.forEach((name, i) => {
        let p = people[name];
        if (name === 'pickerA' && state.shortage > .5 && !stockout) p = people.pickerA1;
        let x = 0, z = 0, yaw = 0, kind: Pose = p.pose ?? 'idle', dist = 0, moving = false, visible = true;
        // Story moments: at the stockout the picker finds A2 empty; in "How it works" the second
        // picker steps out of the forklift's aisle to approve the transfer on a tablet.
        if (name === 'pickerA' && stockout) { x = .3; z = -2.6; yaw = Math.PI / 2; kind = 'search'; }
        else if (name === 'pickerB' && state.label === 'decision') { x = 5.55; z = 3.2; yaw = Math.PI + .45; kind = state.step === 0 ? 'tablet' : 'scan'; }
        else if (p.plan) { const s = p.plan.sample(time + (p.offset ?? 0)); x = s.x; z = s.z; yaw = s.yaw; kind = s.pose; dist = s.dist; moving = s.moving; }
        else if (p.at) [x, z, yaw] = p.at;
        if (name === 'dock02' && state.label === 'decision' && state.step === 2) kind = 'wave';
        if (name === 'driver') visible = state.truck < .002;
        pose(i, p, x, z, yaw, kind, dist, moving, time, visible);
      });
      for (const mesh of Object.values(parts)) mesh.instanceMatrix.needsUpdate = true;

      // The story forklift (scrolled), with the A3 pallet on its forks from lift-off to the trailer.
      const story = storyLift(state.pallet, state.loading), s = story.lift;
      model.lift.position.set(s.x, .5, s.z); model.lift.rotation.y = s.yaw; carriage(model.lift).position.y = s.fork;
      const [fx, fz] = forward(s.yaw);
      model.movingPallet.visible = story.attached;
      model.movingPallet.position.set(s.x + fx * PALLET_REACH, FORK_TOP + s.fork, s.z + fz * PALLET_REACH);
      model.movingPallet.rotation.y = s.yaw - Math.PI / 2;
      if (!story.picked) model.movingPallet.position.set(6.6, 2.15, -2);
      model.selectedStock.visible = !story.picked;

      // Dock 04: the second forklift shuttles staged pallets into the parked truck.
      const d = dockLiftPlan.sample(time);
      model.dockLift.position.set(d.x, .5, d.z); model.dockLift.rotation.y = d.yaw; carriage(model.dockLift).position.y = d.fork;
      const [dx, dz] = forward(d.yaw);
      model.dockPallet.visible = d.carry; model.stagedPallet.visible = !d.carry;
      model.dockPallet.position.set(d.x + dx * PALLET_REACH, FORK_TOP + d.fork, d.z + dz * PALLET_REACH); model.dockPallet.rotation.y = d.yaw - Math.PI / 2;

      // Robots.
      model.robots.forEach((robot, i) => { const r = robotPlans[i].sample(time + i * 5); robot.position.set(r.x, .5, r.z); robot.rotation.y = r.yaw; });

      // Conveyor.
      const span = CONVEYOR.to - CONVEYOR.from;
      for (let i = 0; i < CONVEYOR.count; i++) {
        const u = ((time * CONVEYOR.speed + i * (span + 1) / CONVEYOR.count) % (span + 1));
        const grow = Math.min(1, u / .25), x = CONVEYOR.from + u;
        dummy.position.set(Math.min(x, CONVEYOR.to + .3), CONVEYOR.y, CONVEYOR.z); dummy.rotation.set(0, (i % 3 - 1) * .08, 0);
        dummy.scale.setScalar(u > span + .3 ? 0 : grow); dummy.updateMatrix(); cartons.setMatrixAt(i, dummy.matrix);
      }
      cartons.instanceMatrix.needsUpdate = true;

      // Road traffic, only in the wide opening and closing shots.
      const road = [model.ambientTruck, model.supplierTruck, model.deliveryVan, model.passingCar];
      road.forEach((vehicle, i) => {
        const a = (ambient * .009 + [.09, .36, .61, .83][i]) % 1;
        ROAD.getPointAt(a, vehicle.position); ROAD.getTangentAt(a, tangent); vehicle.rotation.y = Math.atan2(tangent.x, tangent.z);
        vehicle.visible = state.ambient > .02;
      });

      // Rack status lights.
      const blink = state.label === 'problem' && state.problemStep >= 1 ? (Math.sin(time * 6) > 0 ? 1 : .35) : 1;
      const a2 = state.label === 'decision' || (state.label === 'forecast' && state.solutionStep >= 2) ? C.mint : state.shortage > .5 ? C.red : C.orange;
      [C.cream, a2, C.mint, C.amber].forEach((tone, i) => lamps.setColorAt(i, color.set(tone).multiplyScalar((i === 1 ? blink : 1) * (i === 0 ? .55 : 1))));
      lamps.instanceColor!.needsUpdate = true;

      // Screen.
      const mode = screenFor(state);
      if (mode !== shown) { shown = mode; drawScreen(ctx, mode); texture.needsUpdate = true; }
    },
  };
}
