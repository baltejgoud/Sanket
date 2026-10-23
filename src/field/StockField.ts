import * as THREE from "three";
import { createField, decisionProgress, FLAG_NEW, FLAG_SHEET, type Decision, type FieldModel } from "./model";
import { fieldStore, type Readout, type Shot } from "./store";
import { decideMask, drawSlide, loadFaces, projectionRect, SLIDE_COLOR, SLIDE_STRENGTH, slideFor, type ProjectionCopy, type Slide } from "./projection";
import {
  arcFragment,
  arcVertex,
  bandFragment,
  bandVertex,
  columnFragment,
  columnVertex,
  floorFragment,
  floorVertex,
  travellerFragment,
  travellerVertex,
} from "./shaders";

export interface Anchor {
  el: HTMLElement;
  /** returns a world position for the current model */
  at: (m: FieldModel) => [number, number, number];
}

export interface StockFieldOptions {
  canvas: HTMLCanvasElement;
  cols: number;
  rows: number;
  dpr: number;
  reducedMotion: boolean;
  /** deterministic still frame for the poster render */
  poster?: boolean;
  anchors?: Anchor[];
  onFail?: () => void;
  /** the device cannot hold the frame rate even at reduced quality */
  onSlow?: () => void;
  /** words the projector casts, in the page language */
  projection?: ProjectionCopy;
  /** the projector changed slide (mirrored to the stage for labels and tests) */
  onSlide?: (slide: Slide) => void;
}

const UNITS_PER_HEIGHT = 40;
const WAVE_SLOTS = 6;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Expose the readout helper so the HUD shares the model's arithmetic. */
export function readCell(m: FieldModel, k: number, decide: number, level: number): Readout {
  const i = k % m.cols;
  const j = Math.floor(k / m.cols);
  const pr = decisionProgress(decide, m.decision[k] as Decision, m.delay[k]);
  let h = m.stock0[k] + (m.stock1[k] - m.stock0[k]) * pr;
  h += (m.stock1[k] - h) * level;
  const ratio = h / Math.max(m.stock1[k], 0.05);
  const flags = m.flags[k];
  const status: Readout["status"] =
    flags & FLAG_NEW && pr < 0.5 ? "new" : ratio < 0.5 ? "short" : ratio > 1.65 ? "over" : flags & FLAG_SHEET && pr < 0.5 ? "sheet" : "ok";
  return {
    sku: `SKU-${String(1000 + ((i * 7919 + j * 3571) % 9000))}`,
    location: `LOC ${String(j + 1).padStart(2, "0")}·${String(i + 1).padStart(2, "0")}`,
    onHand: Math.round(h * UNITS_PER_HEIGHT),
    need: Math.round(m.stock1[k] * UNITS_PER_HEIGHT),
    status,
  };
}

export class StockField {
  readonly model: FieldModel;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
  private uniforms: Record<string, THREE.IUniform>;
  private disposables: { dispose: () => void }[] = [];
  private frame = 0;
  private last = 0;
  private clock = 0;
  private running = false;
  private disposed = false;
  private needsFrame = true;
  private opts: StockFieldOptions;
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private pointerNdc = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  /** device tilt, -1..1, added to the pointer's parallax (phones, when the visitor allows it) */
  private tilt = new THREE.Vector2(0, 0);
  private lookNdc = new THREE.Vector3();
  private look = new THREE.Vector2();
  private pointerOnField = false;
  private hoverStrength = 0;
  private waveCursor = 0;
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6);
  private hit = new THREE.Vector3();
  private hoverCell = -1;
  private eased = { signal: 0, forecast: 0, level: 0, focus: 0, decide: 0 };
  private focusPoint = new THREE.Vector3();
  private unsubscribe: () => void;
  private width = 1;
  private height = 1;
  private anchorTf: string[] = [];
  private dpr: number;
  // Frame governor (see govern()).
  private gov = { frames: 0, slow: 0, skip: 90 };
  private lastRaf = 0;
  private lastDraw = 0;
  private paced = false;
  private settling = true;
  private governed = false;
  private inTick = false;
  /** the visitor paused motion: render still frames, as for reduced motion */
  private stillPref = false;
  // The projector (see projection.ts): the slide on the texture, the one wanted, and its light.
  private proj = {
    canvas: document.createElement("canvas"),
    texture: null as THREE.CanvasTexture | null,
    drawn: "" as string,
    slide: "off" as Slide,
    amt: 0,
    copy: { inStock: "In stock", signals: [], lang: "en" } as ProjectionCopy,
  };

  constructor(opts: StockFieldOptions) {
    this.opts = opts;
    this.dpr = opts.dpr;
    this.model = createField(opts.cols, opts.rows);
    const m = this.model;
    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: opts.dpr < 2,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: !!opts.poster,
    });
    this.renderer.setPixelRatio(opts.dpr);
    this.renderer.setClearColor(0x0b0c0a, 1);
    this.scene.fog = null;

    const col = (hex: string) => new THREE.Color(hex);
    this.uniforms = {
      uTime: { value: 0 },
      uIntro: { value: opts.poster || opts.reducedMotion ? 1 : 0 },
      uSignal: { value: 0 },
      uForecast: { value: 0 },
      uDecide: { value: 0 },
      uLevel: { value: 0 },
      uWaves: { value: Array.from({ length: WAVE_SLOTS }, () => new THREE.Vector4(0, 0, -99, 0)) },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uFocus: { value: new THREE.Vector4(0, 0, 6, 0) },
      uFocusAmt: { value: 0 },
      uIntroOrigin: { value: new THREE.Vector2(m.width * 0.18, m.depth * 0.1) },
      uIntroReach: { value: Math.hypot(m.width, m.depth) * 0.9 },
      uColSize: { value: 0.5 },
      uBone: { value: col("#ece8df") },
      uShadow: { value: col("#3b3d37") },
      uSignalColor: { value: col("#ff5a1f") },
      uInk: { value: col("#0b0c0a") },
      uHaze: { value: col("#171914") },
      uMint: { value: col("#9fd8c9") },
      uLine: { value: col("#3d4239") },
      uHalf: { value: new THREE.Vector2(m.width / 2 + 0.5, m.depth / 2 + 0.5) },
      uFogNear: { value: 26 },
      uFogFar: { value: 78 },
      uProjTex: { value: null },
      uProjRect: { value: new THREE.Vector4() },
      uProjMask: { value: new THREE.Vector3(1, 0, 0) },
      uProjColor: { value: new THREE.Color(0, 0, 0) },
      uProjAmt: { value: 0 },
    };
    this.buildProjector();

    this.buildColumns();
    this.buildBands();
    this.buildTravellers();
    this.buildArcs();
    this.buildFloor();

    this.width = Math.max(1, opts.canvas.clientWidth);
    this.height = Math.max(1, opts.canvas.clientHeight);
    const [pos, look] = this.shot(fieldStore.get().target.shot, fieldStore.get().target.focus);
    this.camPos.copy(pos);
    this.camLook.copy(look);
    // The poster is a still frame, so give it one signal already travelling.
    if (opts.poster) (this.uniforms.uWaves.value[0] as THREE.Vector4).set(m.signalOrigins[0].x + 6, m.signalOrigins[0].z, 4.4, 1);

    this.unsubscribe = fieldStore.subscribe(() => this.wake());
    opts.canvas.addEventListener("webglcontextlost", this.onContextLost);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
  }

  /* ---------- geometry ---------- */

  private instanced(base: THREE.BufferGeometry, count: number) {
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index;
    for (const name of Object.keys(base.attributes)) g.setAttribute(name, base.attributes[name]);
    g.instanceCount = count;
    this.disposables.push(base, g);
    return g;
  }

  private columnAttributes(g: THREE.InstancedBufferGeometry) {
    const m = this.model;
    const a = new Float32Array(m.count * 4);
    const b = new Float32Array(m.count * 4);
    const c = new Float32Array(m.count * 2);
    for (let k = 0; k < m.count; k++) {
      a.set([m.pos[k * 2], m.pos[k * 2 + 1], m.stock0[k], m.stock1[k]], k * 4);
      b.set([m.lo[k], m.hi[k], m.decision[k], m.delay[k]], k * 4);
      c.set([m.seed[k], m.flags[k]], k * 2);
    }
    g.setAttribute("aA", new THREE.InstancedBufferAttribute(a, 4));
    g.setAttribute("aB", new THREE.InstancedBufferAttribute(b, 4));
    g.setAttribute("aC", new THREE.InstancedBufferAttribute(c, 2));
  }

  private add(mesh: THREE.Object3D & { material: THREE.Material }) {
    mesh.frustumCulled = false;
    this.scene.add(mesh);
    this.disposables.push(mesh.material);
  }

  private buildColumns() {
    const box = new THREE.BoxGeometry(1, 1, 1);
    box.translate(0, 0.5, 0);
    const g = this.instanced(box, this.model.count);
    this.columnAttributes(g);
    const mat = new THREE.ShaderMaterial({ vertexShader: columnVertex, fragmentShader: columnFragment, uniforms: this.uniforms });
    this.add(new THREE.Mesh(g, mat));
  }

  private buildBands() {
    const box = new THREE.BoxGeometry(1, 1, 1);
    box.translate(0, 0.5, 0);
    const g = this.instanced(box, this.model.count);
    this.columnAttributes(g);
    const mat = new THREE.ShaderMaterial({
      vertexShader: bandVertex,
      fragmentShader: bandFragment,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(g, mat);
    mesh.renderOrder = 2;
    this.add(mesh);
  }

  private buildTravellers() {
    const t = this.model.travellers;
    const g = this.instanced(new THREE.BoxGeometry(1, 1, 1), t.count);
    const kd = new Float32Array(t.count * 2);
    for (let n = 0; n < t.count; n++) kd.set([t.kind[n], t.delay[n]], n * 2);
    g.setAttribute("aFrom", new THREE.InstancedBufferAttribute(t.from, 3));
    g.setAttribute("aTo", new THREE.InstancedBufferAttribute(t.to, 3));
    g.setAttribute("aT", new THREE.InstancedBufferAttribute(kd, 2));
    const mat = new THREE.ShaderMaterial({ vertexShader: travellerVertex, fragmentShader: travellerFragment, uniforms: this.uniforms });
    this.add(new THREE.Mesh(g, mat));
  }

  private buildArcs() {
    const t = this.model.travellers;
    const steps = 28;
    const pos: number[] = [];
    const ts: number[] = [];
    const delays: number[] = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const point = (s: number) => {
      const e = s * s * (3 - 2 * s);
      const p1 = a.clone().lerp(c, e);
      const p2 = c.clone().lerp(b, e);
      return p1.lerp(p2, e);
    };
    for (let n = 0; n < t.count; n++) {
      if (t.kind[n] !== 0) continue;
      a.fromArray(t.from, n * 3);
      b.fromArray(t.to, n * 3);
      const d = Math.hypot(a.x - b.x, a.z - b.z);
      c.copy(a).add(b).multiplyScalar(0.5).add(v3(0, 2 + d * 0.42, 0));
      for (let s = 0; s < steps; s++) {
        const p0 = point(s / steps);
        const p1 = point((s + 1) / steps);
        pos.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
        ts.push(s / steps, (s + 1) / steps);
        delays.push(t.delay[n], t.delay[n]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aT", new THREE.Float32BufferAttribute(ts, 1));
    g.setAttribute("aDelay", new THREE.Float32BufferAttribute(delays, 1));
    this.disposables.push(g);
    const mat = new THREE.ShaderMaterial({
      vertexShader: arcVertex,
      fragmentShader: arcFragment,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(g, mat);
    lines.renderOrder = 3;
    this.add(lines);
  }

  private buildFloor() {
    const m = this.model;
    const g = new THREE.PlaneGeometry(m.width + 60, m.depth + 60);
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.002, 0);
    this.disposables.push(g);
    const mat = new THREE.ShaderMaterial({
      vertexShader: floorVertex,
      fragmentShader: floorFragment,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
    });
    this.add(new THREE.Mesh(g, mat));
  }

  /* ---------- projector ---------- */

  private buildProjector() {
    const m = this.model;
    const r = projectionRect(m);
    const c = this.proj.canvas;
    // Phones (small grids) get a 1024-wide slide; ground cells stay ~30px either way.
    c.width = m.cols < 30 ? 1024 : 1536;
    c.height = Math.round((c.width * r.sizeZ) / r.sizeX);
    const tex = new THREE.CanvasTexture(c);
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    this.proj.texture = tex;
    this.disposables.push(tex);
    this.uniforms.uProjTex.value = tex;
    (this.uniforms.uProjRect.value as THREE.Vector4).set(r.minX, r.minZ, r.sizeX, r.sizeZ);
    if (this.opts.projection) this.proj.copy = this.opts.projection;
    loadFaces(this.proj.copy).then(() => this.redrawSlide());
  }

  /** Slide key: the slide plus whatever changes its drawing (the focused problem). */
  private slideKey(slide: Slide, focus: number) {
    return slide === "reticle" ? `reticle:${focus}` : slide;
  }

  private drawProjection(slide: Slide, focus: number) {
    const ctx = this.proj.canvas.getContext("2d");
    if (!ctx || !this.proj.texture) return;
    if (slide !== "off") drawSlide(ctx, slide, this.model, this.proj.copy, focus);
    this.proj.texture.needsUpdate = true;
    this.proj.drawn = this.slideKey(slide, focus);
    if (this.proj.slide !== slide) {
      this.proj.slide = slide;
      this.opts.onSlide?.(slide);
    }
    const [r, g, b] = SLIDE_COLOR[slide];
    (this.uniforms.uProjColor.value as THREE.Color).setRGB(r, g, b);
  }

  /** Redraw the current slide (fonts arrived, or the language changed). */
  private redrawSlide() {
    if (this.disposed) return;
    const t = fieldStore.get().target;
    this.drawProjection(this.proj.slide, t.focus);
    this.wake();
  }

  /** The words the projector casts, in the page language. */
  setProjectionCopy(copy: ProjectionCopy) {
    this.proj.copy = copy;
    loadFaces(copy).then(() => this.redrawSlide());
  }

  /* ---------- camera choreography ---------- */

  private shot(shot: Shot, focus: number): [THREE.Vector3, THREE.Vector3] {
    const m = this.model;
    const s = m.width / 47;
    let pos: THREE.Vector3;
    let look: THREE.Vector3;
    switch (shot) {
      case "signal":
        pos = v3(-4, 25, 33);
        look = v3(2, 0, -3);
        break;
      case "problems": {
        const f = m.foci[Math.max(0, focus)] ?? { x: 0, z: 0, r: 6 };
        const reach = Math.max(1, f.r / 5);
        look = v3(f.x / s, 0.6, f.z / s);
        pos = v3(f.x / s - 10 * reach, 12 * reach, f.z / s + 16 * reach);
        if (focus < 0) {
          pos = v3(-6, 22, 30);
          look = v3(2, 0, -2);
        }
        break;
      }
      case "forecast":
        pos = v3(-25, 7.5, 17);
        look = v3(3, 2.2, -2);
        break;
      case "decide":
        pos = v3(13, 27, 27);
        look = v3(1, 0, -1.5);
        break;
      case "level":
        pos = v3(-4, 31, 27);
        look = v3(-7, 0, -4);
        break;
      default:
        pos = v3(-15, 17.5, 25);
        look = v3(3.5, 0, -2.5);
    }
    pos.multiplyScalar(s);
    look.multiplyScalar(s);
    // Narrow and portrait viewports pull back so the field still reads.
    const aspect = this.width / Math.max(this.height, 1);
    if (aspect < 1.35) {
      const k = Math.pow(1.35 / aspect, 0.72);
      pos.sub(look).multiplyScalar(k).add(look);
    }
    return [pos, look];
  }

  /* ---------- input ---------- */

  /** pointer in normalised device coordinates; onField = over a field zone */
  setPointer(x: number, y: number, onField: boolean) {
    this.pointerNdc.set(x, y);
    this.pointerOnField = onField;
    if (onField) this.pick();
    else {
      this.hoverCell = -1;
      fieldStore.setReadout(null);
    }
    this.wake();
  }

  /** device tilt in -1..1 (x: roll right, y: tip back), smoothed with the pointer's parallax */
  setTilt(x: number, y: number) {
    this.tilt.set(x, y);
    this.wake();
  }

  /** send a signal from the cell under the pointer */
  signalAtPointer() {
    if (this.hoverCell < 0) return;
    const m = this.model;
    this.addWave(m.pos[this.hoverCell * 2], m.pos[this.hoverCell * 2 + 1], 1);
  }

  private pick() {
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.plane, this.hit)) return;
    const m = this.model;
    const i = Math.round((this.hit.x + m.width / 2) / m.spacing);
    const j = Math.round((this.hit.z + m.depth / 2) / m.spacing);
    if (i < 0 || j < 0 || i >= m.cols || j >= m.rows) {
      this.hoverCell = -1;
      fieldStore.setReadout(null);
      return;
    }
    this.hoverCell = j * m.cols + i;
    fieldStore.setReadout(readCell(m, this.hoverCell, this.eased.decide, this.eased.level));
  }

  private addWave(x: number, z: number, strength: number) {
    const slot = this.uniforms.uWaves.value[this.waveCursor % WAVE_SLOTS] as THREE.Vector4;
    slot.set(x, z, this.clock, strength);
    this.waveCursor++;
    this.wake();
  }

  /* ---------- lifecycle ---------- */

  resize() {
    const c = this.opts.canvas;
    const w = Math.max(1, c.clientWidth);
    const h = Math.max(1, c.clientHeight);
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const t = fieldStore.get().target;
    const [pos, look] = this.shot(t.shot, t.focus);
    if (this.still) {
      this.camPos.copy(pos);
      this.camLook.copy(look);
    }
    this.wake();
  }

  /** Compile every program before the first frame, off the main thread where the driver allows
   *  (KHR_parallel_shader_compile), so the first render is not one long blocking task. */
  async warm() {
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch {
      // Older drivers: the first render compiles synchronously instead.
    }
  }

  start() {
    this.running = true;
    this.wake();
  }

  /** Calm mode: still frames that still follow each chapter's state, switchable without a reboot. */
  setStill(still: boolean) {
    if (still === this.stillPref) return;
    this.stillPref = still;
    if (still) this.uniforms.uIntro.value = 1;
    this.settling = true;
    this.wake();
  }

  private get still() {
    return this.opts.reducedMotion || !!this.opts.poster || this.stillPref;
  }

  wake() {
    this.needsFrame = true;
    // Inside tick, the tick itself schedules the next frame. Scheduling here too (a queued pulse
    // becoming a wave mid-update did) started a second loop, then a third: the field rendered
    // once more per frame for every signal the page sent.
    if (this.disposed || !this.running || this.frame || this.inTick || document.hidden) return;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.frame = 0;
    if (this.disposed) return;
    const s = fieldStore.get();
    if (!s.visible && !this.opts.poster) return;
    const still = this.still;
    if (!still) {
      this.govern(now);
      // Paced: with nothing easing and no input, the idle field (breathing, waves) draws at ~30 fps.
      if (this.paced && !this.settling && !this.needsFrame && now - this.lastDraw < 30) {
        this.frame = requestAnimationFrame(this.tick);
        return;
      }
    }
    const dt = Math.min((now - this.last) / 1000, 1 / 20);
    this.last = now;
    this.inTick = true;
    let settling = false;
    try {
      settling = this.settling = this.update(still ? 0 : dt, still);
      this.renderer.render(this.scene, this.camera);
    } finally {
      this.inTick = false;
    }
    this.lastDraw = now;
    this.needsFrame = false;
    if (!still || settling) this.frame = requestAnimationFrame(this.tick);
  };

  /**
   * Frame governor. Judged on 90-frame samples of the rAF interval while the field runs:
   * if most frames miss ~36 fps, drop to pixel ratio 1 and pace idle frames to 30 fps; if most
   * still miss ~22 fps after that, hand over to the poster (onSlow). Pauses and long tasks
   * (gaps over 250 ms) are not counted, and the first 90 frames (boot, intro) are skipped.
   */
  private govern(now: number) {
    const interval = now - this.lastRaf;
    this.lastRaf = now;
    const g = this.gov;
    if (this.governed || interval > 250) return;
    if (g.skip > 0) {
      g.skip--;
      return;
    }
    g.frames++;
    if (interval > (this.paced ? 45 : 28)) g.slow++;
    if (g.frames < 90) return;
    const slow = g.slow > g.frames / 2;
    g.frames = g.slow = 0;
    if (!slow) return;
    if (!this.paced) {
      this.paced = true;
      g.skip = 30;
      if (this.dpr > 1) {
        this.dpr = 1;
        this.renderer.setPixelRatio(1); // resizes the drawing buffer
      }
    } else {
      this.governed = true;
      this.opts.onSlow?.();
    }
  }

  /** returns true while anything is still moving */
  private update(dt: number, still: boolean) {
    const s = fieldStore.get();
    const t = s.target;
    const u = this.uniforms;
    const m = this.model;
    if (!still) this.clock += dt;
    u.uTime.value = this.opts.poster ? 6.5 : this.clock;

    const ease = (k: number) => (still ? 1 : 1 - Math.exp(-k * dt));
    const e = this.eased;
    e.signal += (t.signal - e.signal) * ease(2.4);
    e.forecast += (t.forecast - e.forecast) * ease(2.6);
    e.level += (t.level - e.level) * ease(2);
    e.focus += ((t.focus >= 0 ? 1 : 0) - e.focus) * ease(3);
    e.decide += (s.decide - e.decide) * ease(5.5);
    u.uSignal.value = e.signal;
    u.uForecast.value = e.forecast;
    u.uLevel.value = e.level;
    u.uDecide.value = e.decide;
    u.uFocusAmt.value = e.focus;
    if (!still && u.uIntro.value < 1) u.uIntro.value = Math.min(1, u.uIntro.value + dt / 2.4);

    if (t.focus >= 0) {
      const f = m.foci[t.focus];
      this.focusPoint.set(f.x, 0, f.z);
      const fv = u.uFocus.value as THREE.Vector4;
      fv.x += (f.x - fv.x) * ease(4);
      fv.y += (f.z - fv.y) * ease(4);
      fv.z += (f.r - fv.z) * ease(4);
    }

    // Projector: fade out, change the slide while dark, fade in at the slide's strength.
    const want = slideFor(t.shot);
    const wantKey = this.slideKey(want, t.focus);
    const pj = this.proj;
    let lit = wantKey === pj.drawn ? SLIDE_STRENGTH[want] : 0;
    // Out quickly (~0.4s), in at the same rate.
    pj.amt += (lit - pj.amt) * ease(9);
    if (wantKey !== pj.drawn && pj.amt < 0.02) {
      pj.amt = 0;
      this.drawProjection(want, t.focus);
      lit = SLIDE_STRENGTH[want]; // keeps the loop going to fade the new slide in
    }
    u.uProjAmt.value = pj.amt;
    const mask = u.uProjMask.value as THREE.Vector3;
    if (pj.slide === "decide") mask.set(...decideMask(e.decide));
    else mask.set(1, 0, 0);

    // Pulses queued by the page: named signals, problem 4, the finale.
    for (const p of fieldStore.takePulses()) {
      if (!still) this.addWave(p.u * m.width - m.width / 2, p.v * m.depth - m.depth / 2, p.strength);
    }

    // Camera glide plus a window-like parallax: the eye moves with the pointer (or the phone's
    // tilt) without turning, and the frustum shifts so the look point stays pinned on screen.
    // Near, tall stock swings against the floor, as through a pane of glass.
    const [pos, look] = this.shot(t.shot, t.focus);
    this.camPos.lerp(pos, ease(1.9));
    this.camLook.lerp(look, ease(2.2));
    this.look.set(this.pointerNdc.x + this.tilt.x, this.pointerNdc.y + this.tilt.y).clampScalar(-1.2, 1.2);
    this.pointerSmooth.lerp(this.look, ease(3));
    this.hoverStrength += ((this.pointerOnField ? 1 : 0) - this.hoverStrength) * ease(6);
    const cam = this.camera;
    cam.position.copy(this.camPos);
    cam.lookAt(this.camLook);
    cam.clearViewOffset();
    if (!still) {
      cam.translateX(this.pointerSmooth.x * 2.2);
      cam.translateY(this.pointerSmooth.y * 1.2);
      cam.updateMatrixWorld();
      this.lookNdc.copy(this.camLook).project(cam);
      cam.setViewOffset(this.width, this.height, (this.lookNdc.x * this.width) / 2, (-this.lookNdc.y * this.height) / 2, this.width, this.height);
    }
    if (this.hoverCell >= 0) {
      const p = u.uPointer.value as THREE.Vector3;
      p.x += (m.pos[this.hoverCell * 2] - p.x) * ease(10);
      p.y += (m.pos[this.hoverCell * 2 + 1] - p.y) * ease(10);
    }
    (u.uPointer.value as THREE.Vector3).z = still ? 0 : this.hoverStrength;

    // Projected anchors for HTML labels.
    if (this.opts.anchors?.length) {
      const v = new THREE.Vector3();
      this.opts.anchors.forEach((a, n) => {
        v.set(...a.at(m));
        // Labels scale with depth, so they sit in the scene rather than on the glass.
        const depth = Math.min(1.25, Math.max(0.75, 34 / Math.max(1, cam.position.distanceTo(v))));
        v.project(cam);
        const x = (v.x * 0.5 + 0.5) * this.width;
        const y = (-v.y * 0.5 + 0.5) * this.height;
        // Skip identical writes: an idle camera would otherwise restyle the labels every frame.
        const tf = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${depth.toFixed(2)})`;
        if (this.anchorTf[n] !== tf) a.el.style.transform = this.anchorTf[n] = tf;
        const behind = v.z > 1 ? "true" : "false";
        if (a.el.dataset.behind !== behind) a.el.dataset.behind = behind;
      });
    }

    const moving =
      Math.abs(t.signal - e.signal) > 0.002 ||
      Math.abs(t.forecast - e.forecast) > 0.002 ||
      Math.abs(t.level - e.level) > 0.002 ||
      Math.abs(s.decide - e.decide) > 0.001 ||
      Math.abs(lit - pj.amt) > 0.002 ||
      this.camPos.distanceTo(pos) > 0.01;
    return moving;
  }

  private onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    } else this.wake();
  };

  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.dispose();
    this.opts.onFail?.();
  };

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.unsubscribe();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.opts.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.disposables.forEach(d => d.dispose());
    this.renderer.dispose();
  }
}
