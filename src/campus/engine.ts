import * as T from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildCampus } from './models';
import { sampleTimeline, facilityAnchors, type Facility, type TimelineState } from './timeline';
import { createStreams } from './streams';
import { createRackFocus } from './rackFocus';
import { createAnnotations, type Vec } from './annotate';
import './scene.css';

// A fluorescent tube's ignition: two failed strikes, a dim catch, then full light. [seconds, level]
const IGNITION: [number, number][] = [[0, 0], [.05, .85], [.1, .04], [.19, .62], [.24, 0], [.38, .4], [.45, .12], [.56, 1]];
const ignition = (t: number) => { let level = 0; for (const [at, v] of IGNITION) if (t >= at) level = v; return level; };
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const UP = new T.Vector3(0, 1, 0);
const RACK_X = [-1.8, 2.4, 6.6, 10.8];
const A2: Vec = [2.4, 5.1, -1.5], A3: Vec = [6.6, 5.1, -2], A4: Vec = [10.8, 5.1, -1.5];
// Where the three data streams of the "connect" beat start: the street, the office, dispatch.
const SOURCES: Vec[] = [[-12, 1.4, 9.5], [-8, 6.4, 3], [12.7, 4.4, 10.1]];
const bez = (a: Vec, c: Vec, b: Vec) => new T.QuadraticBezierCurve3(new T.Vector3(...a), new T.Vector3(...c), new T.Vector3(...b));
// Lets input and paint through between boot phases. A message, unlike a timer, is not throttled in a background tab.
const nextTask = () => new Promise<void>(resolve => { const channel = new MessageChannel(); channel.port1.onmessage = () => resolve(); channel.port2.postMessage(0); });
/**
 * Device tier, decided before anything is built. Touch devices with 4 GB of memory or less, or four
 * cores or fewer, start without SSAO or bloom, at 1× pixels, with a 1024² shadow map and ambient
 * life at 15 fps. Everything else starts high and the frame-time governor can still step it down.
 */
function lowTier() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return matchMedia('(pointer: coarse)').matches && ((nav.deviceMemory ?? 8) <= 4 || (navigator.hardwareConcurrency || 8) <= 4);
}
// If frames are being scheduled but none has drawn this long after the first, show the HTML story instead.
const FIRST_FRAME_TIMEOUT = 3000;

/**
 * Builds the scene in phases across tasks and compiles its shaders in parallel before the first
 * draw, so booting never freezes the page. Resolves once the first frame is requested; `onReady`
 * fires after that frame has actually drawn (which can be much later in a background tab).
 */
export async function createCampus(host: HTMLElement, onReady: () => void, onFailure: () => void) {
  // Boot phases show up as `campus:*` performance measures (scripts/check-boot.mjs prints them).
  let phaseStart = performance.now();
  const phase = (name: string) => { const now = performance.now(); performance.measure(`campus:${name}`, { start: phaseStart, end: now }); phaseStart = now; };
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor('#090b09', 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.prepend(renderer.domElement);
  phase('context');
  await nextTask();
  phaseStart = performance.now();
  const scene = new T.Scene();
  // A restrained perspective lens gives aisles depth without wide-angle distortion.
  const camera = new T.PerspectiveCamera(32, 1, .1, 260);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new SSAOPass(scene, camera, 512, 512, 12);
  ao.kernelRadius = .65; ao.minDistance = .0004; ao.maxDistance = .055;
  composer.addPass(ao);
  // Only emissive lamps and signal orange cross the threshold, so the glow stays on the lights.
  const bloom = new UnrealBloomPass(new T.Vector2(512, 512), .4, .35, 1.05);
  composer.addPass(bloom);
  const output = new OutputPass(); composer.addPass(output);
  phase('passes');
  await nextTask();
  phaseStart = performance.now();
  const model = await buildCampus(nextTask); scene.add(model.root);
  const rackFocus = createRackFocus(); scene.add(rackFocus.group);
  phase('model');
  await nextTask();
  phaseStart = performance.now();
  const demandBatches: { mesh: T.InstancedMesh; count: number }[] = [];
  model.demandStock.traverse(o => { if (o instanceof T.InstancedMesh) demandBatches.push({ mesh: o, count: o.count }); });
  const highlightedStock: T.MeshStandardMaterial[] = [];
  model.selectedStock.traverse(o => { if (o instanceof T.Mesh && o.material === model.materials.carton) { o.material = model.materials.carton.clone(); highlightedStock.push(o.material); } });
  const stockColor = new T.Color('#c9b795'), activeColor = new T.Color('#ee6621');
  scene.add(new T.HemisphereLight('#d7e4e0', '#61523f', 1.15));
  const sun = new T.DirectionalLight('#ffead3', 2.7); sun.position.set(-12, 32, 14); sun.castShadow = true;
  let low = lowTier();
  sun.shadow.mapSize.setScalar(low ? 1024 : 2048); Object.assign(sun.shadow.camera, { left: -29, right: 29, top: 29, bottom: -29, near: 1, far: 90 });
  sun.shadow.bias = -.0003; sun.shadow.normalBias = .035; sun.shadow.radius = 3;
  scene.add(sun);
  const rim = new T.DirectionalLight('#afcedb', 1.65); rim.position.set(18, 12, -16); scene.add(rim);
  const fill = new T.DirectionalLight('#e5ede5', .55); fill.position.set(5, 8, 24); scene.add(fill);
  const interior = new T.PointLight('#ffd6a0', 55, 25, 2); interior.position.set(5, 6, 0); scene.add(interior);
  const officeLight = new T.PointLight('#ffbb6b', 24, 14, 2); officeLight.position.set(-8, 4, 8); scene.add(officeLight);
  const bayLights = [-2.2, 5, 12.2].map(x => { const bayLight = new T.PointLight('#ffbd79', 12, 7, 2); bayLight.position.set(x, 3.8, 6.5); scene.add(bayLight); return bayLight; });
  // Four circuits switch on in sequence at the opening: street, office, warehouse, docks.
  const lampOff = new T.Color('#3d3b35');
  const { lamp, lampDock, lampOffice, lampStreet, window: glazing } = model.materials;
  const banks = ([[0, [lampStreet], []], [.34, [lampOffice, glazing], [officeLight]], [.7, [lamp], [interior]], [1.02, [lampDock], bayLights]] as [number, T.MeshStandardMaterial[], T.PointLight[]][])
    .map(([delay, mats, lights]) => ({ delay, level: -1, mats: mats.map(m => ({ m, color: m.color.clone(), emissive: m.emissiveIntensity, tint: m !== glazing })), lights: lights.map(l => ({ l, intensity: l.intensity })) }));
  function setBank(bank: typeof banks[number], level: number) {
    if (bank.level === level) return;
    bank.level = level;
    for (const { m, color, emissive, tint } of bank.mats) { m.emissiveIntensity = emissive * level; if (tint) m.color.copy(lampOff).lerp(color, level); }
    for (const { l, intensity } of bank.lights) l.intensity = intensity * level;
  }
  // The x-ray lens cuts through the shell only (roof, facade, end wall); everything inside stays solid.
  const lensUniform = { value: new T.Vector3() };
  const lensPatch = (m: T.Material) => {
    m.onBeforeCompile = shader => {
      shader.uniforms.uLens = lensUniform;
      shader.fragmentShader = `uniform vec3 uLens;\n${shader.fragmentShader}`
        .replace('void main() {', 'void main() {\n\tfloat lensGap = distance(gl_FragCoord.xy, uLens.xy) - uLens.z;\n\tif (uLens.z > .5 && lensGap < 0.) discard;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n\tif (uLens.z > .5) totalEmissiveRadiance += vec3(1., .42, .14) * 4. * (1. - smoothstep(0., 3., lensGap));');
    };
    m.customProgramCacheKey = () => 'xray-lens';
  };
  function shell(group: T.Object3D, transparent: boolean) {
    const clones = new Map<T.Material, T.Material>();
    group.traverse(o => {
      if (!(o instanceof T.Mesh) || Array.isArray(o.material)) return;
      const original = o.material as T.Material;
      let clone = clones.get(original);
      if (!clone) {
        clone = original.clone(); clone.transparent = transparent; lensPatch(clone); clones.set(original, clone);
        // Lamps on the shell stay on their circuit.
        for (const bank of banks) for (const entry of [...bank.mats]) if (entry.m === original) bank.mats.push({ ...entry, m: clone as T.MeshStandardMaterial });
      }
      o.material = clone;
    });
    return [...clones.values()];
  }
  shell(model.roof, false);
  const fadingWalls = shell(model.frontWall, true);
  const wallMeshes: T.Mesh[] = [];
  model.frontWall.traverse(o => { if (o instanceof T.Mesh) wallMeshes.push(o); });
  const ground = new T.Mesh(new T.PlaneGeometry(200, 200), new T.ShadowMaterial({ opacity: .24 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.38; ground.receiveShadow = true; scene.add(ground);
  // Solid orange is physical freight; information travels as light (streams.ts).
  const freightPath = new T.CatmullRomCurve3([new T.Vector3(1.4, .1, 10), new T.Vector3(1.4, .1, 15.6), new T.Vector3(5, .1, 16.2), new T.Vector3(14, .1, 16.2), new T.Vector3(19.2, .1, 12), new T.Vector3(19.2, .1, -4)], false, 'centripetal');
  const routeGeo = new T.TubeGeometry(freightPath, 120, .045, 5, false);
  const routeMat = new T.MeshBasicMaterial({ color: '#ff641d', transparent: true, opacity: .8 });
  const route = new T.Mesh(routeGeo, routeMat); scene.add(route);
  // Overlays fade over time rather than popping at beat boundaries; the transfer path draws itself.
  const targetMaterials = model.demandTarget.children.map(c => (c as T.LineSegments).material as T.LineBasicMaterial);
  const transferMaterials = model.transferGuide.children.map(c => { const m = (c as T.Mesh).material as T.MeshBasicMaterial; m.transparent = true; return m; });
  const transferTube = (model.transferGuide.children[0] as T.Mesh).geometry, transferArrow = model.transferGuide.children[1];
  const markdownMaterial = model.markdownZone.material as T.LineBasicMaterial; markdownMaterial.transparent = true;
  const fade = { target: 0, proposed: 0, transfer: 0, markdown: 0, connect: 0 };
  // Demand signals: comets of light from the streets into the roof (opening), and three data
  // sources converging on A2 (the "connect" beat).
  const heroStreams = createStreams([
    bez([-27, 2, 20], [-12, 11, 10], [4, 7.4, 0]), bez([28, 2, 16], [16, 12, 8], [6, 7.4, -1]),
    bez([-25, 2, -19], [-10, 12, -10], [3, 7.4, -2]), bez([27, 2, -21], [14, 11, -12], [7, 7.4, -1]),
    bez([1, 2, 27], [2, 13, 14], [5, 7.4, .5]), bez([-31, 4, 2], [-14, 13, 2], [4, 7.4, -.5]),
  ], '#ff7a3d', 12, .22);
  const connectStreams = createStreams(SOURCES.map(a => bez(a, [(a[0] + A2[0]) / 2, 11, (a[2] + A2[2]) / 2], [A2[0], 5.4, A2[2]])), '#a8e6ce', 14, .22);
  scene.add(heroStreams.points, connectStreams.points);
  // A ghost pallet rides the suggested transfer arc as the beat is scrolled.
  const ghostMaterial = new T.MeshStandardMaterial({ color: '#a8e6ce', emissive: '#5fbf98', emissiveIntensity: .7, transparent: true, opacity: .75, depthWrite: false });
  const ghost = new T.Mesh(new T.BoxGeometry(1.1, .8, 1), ghostMaterial); ghost.visible = false; scene.add(ghost);
  const annotations = createAnnotations(host);
  const rackAnchors: Vec[] = RACK_X.map(x => [x, 5.55, 2.5]);
  const wheelsPath = new T.CatmullRomCurve3([[-16, .28, 16.2], [14, .28, 16.2], [19.2, .28, 12], [19.2, .28, -12], [14, .28, -16.3], [-14, .28, -16.3], [-19.2, .28, -12], [-19.2, .28, 12]].map(p => new T.Vector3(...p as [number, number, number])), true, 'centripetal');
  let width = 1, height = 1, mobile = false, progress = 0, reduced = false, selected: Facility = 'warehouse';
  let raf = 0, stopped = false, lastFrame = 0, lastRender = performance.now(), ambientTime = 0, dirty = true, visible = !document.hidden, covered = false;
  let readyFired = false, watchdog = 0;
  let ignitedAt = -1, igniting = true, fading = false, swaying = false, renderedProgress = -1;
  // The camera rig leans toward the pointer on a heavy, nearly critically damped spring.
  let aimX = 0, aimY = 0, swayX = 0, swayY = 0, swayVX = 0, swayVY = 0;
  const basePosition = new T.Vector3(), orbit = new T.Vector3(), side = new T.Vector3();
  const fine = matchMedia('(pointer: fine)').matches;
  const pointer = (e: PointerEvent) => { if (e.pointerType !== 'mouse' || reduced) return; pointerX = e.clientX; pointerY = e.clientY; aimX = e.clientX / innerWidth * 2 - 1; aimY = e.clientY / innerHeight * 2 - 1; dirty = true; };
  const release = () => { aimX = aimY = 0; pointerX = pointerY = -1; dirty = true; };
  // X-ray lens state: an iris on a spring, following the mouse over the roof or a short demo.
  let pointerX = -1, pointerY = -1, lensMode: 'demo' | 'pointer' = 'demo', demoAt = -1;
  let lensX = 0, lensY = 0, lensR = 0, lensV = 0, lensRack = -1, lensMoving = false, streamTime = 0, composerRatio = 1;
  const raycaster = new T.Raycaster(), ndc = new T.Vector2(), hit = new T.Vector3();
  const roofPlane = new T.Plane(new T.Vector3(0, 1, 0), -7), rackPlane = new T.Plane(new T.Vector3(0, 1, 0), -2.6);
  const rayAt = (px: number, py: number, plane: T.Plane) => { ndc.set(px / width * 2 - 1, 1 - py / height * 2); raycaster.setFromCamera(ndc, camera); return raycaster.ray.intersectPlane(plane, hit); };
  const roofHit = (px: number, py: number) => !!rayAt(px, py, roofPlane) && hit.x > -5 && hit.x < 15.5 && hit.z > -8.5 && hit.z < 8.5;
  function rackHit(px: number, py: number) {
    if (!rayAt(px, py, rackPlane) || hit.z < -7.4 || hit.z > 3.4) return -1;
    let best = -1, nearest = 1.6;
    RACK_X.forEach((x, i) => { if (Math.abs(hit.x - x) < nearest) { nearest = Math.abs(hit.x - x); best = i; } });
    return best;
  }
  const labelWidths = new Map<HTMLElement, number>();
  let state: TimelineState = sampleTimeline(0);
  const cameraTarget = new T.Vector3(), cameraGoal = new T.Vector3(), targetGoal = new T.Vector3();
  let cameraScale = state.scale, cameraOffset = 0, cameraInitialized = false, settling = false;
  const projected = new T.Vector3(); const tangent = new T.Vector3();
  const labels = [...host.querySelectorAll<HTMLElement>('[data-anchor]')];
  const caption = host.querySelector<HTMLElement>('[data-decision-caption]');
  const current = host.querySelector<HTMLElement>('[data-current-chapter]');
  const stepLabels = ['Select stock', 'Move to dispatch', 'Load shipment', 'Plan route', 'Shipment on its way'];
  let measuredFrames = 0, totalFrameMs = 0, renderedFrames = 0, highQuality = !low;
  // An unplugged battery under 20% drops to the low tier too (where the Battery API exists).
  (navigator as Navigator & { getBattery?: () => Promise<{ charging: boolean; level: number }> }).getBattery?.().then(b => {
    if (b.charging || b.level > .2 || stopped) return;
    low = true; highQuality = false; ao.enabled = bloom.enabled = false; renderer.setPixelRatio(1); renderer.setSize(width, height); dirty = true;
  }).catch(() => {});
  let slowFrames = 0;
  function resize() {
    width = host.clientWidth; height = host.clientHeight; mobile = width < 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, !highQuality ? 1 : mobile ? 1.25 : 1.5));
    renderer.setSize(width, height); dirty = true;
    composerRatio = Math.min(window.devicePixelRatio, mobile ? 1 : 1.25);
    composer.setPixelRatio(composerRatio);
    composer.setSize(width, height);
    annotations.resize(width, height);
    ao.setSize(Math.ceil(width * .75), Math.ceil(height * .75));
    ao.enabled = bloom.enabled = !mobile && highQuality;
    labelWidths.clear();
  }
  function projectLabels() {
    labels.forEach(label => {
      const anchor = label.dataset.anchor!;
      const facility = anchor as Facility;
      let show = false; let point: [number, number, number] = [0, 0, 0];
      // Problem and solution beats speak through data panels (annotate.ts) instead of labels.
      if (anchor === 'decision') { point = state.pallet < .05 ? [6.6, 3, -2] : state.loading < .98 ? [model.movingPallet.position.x, 2.4, model.movingPallet.position.z] : [model.deliveryTruck.position.x, 3.7, model.deliveryTruck.position.z]; show = state.label === 'decision'; }
      else { point = facilityAnchors[facility]; show = state.label === 'warehouse' && anchor === 'warehouse' && state.progress < 1.43; }
      projected.set(...point).project(camera);
      const x = (projected.x + 1) / 2 * width, y = (1 - projected.y) / 2 * height;
      // Labels stay rendered so CSS can draw them in and out; widths are measured once per showing.
      const shown = show && x >= 20 && x <= width - 40 && y >= 88 && y <= height - 60;
      if (label.dataset.shown !== String(shown)) {
        label.dataset.shown = String(shown); label.setAttribute('aria-hidden', String(!shown));
        if (shown) labelWidths.set(label, label.offsetWidth);
      }
      const safeX = Math.max(12, Math.min(x, width - (labelWidths.get(label) || 200) - 18));
      label.style.transform = `translate3d(${safeX.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    });
    if (caption) caption.textContent = stepLabels[state.step];
    if (current) current.textContent = ['01 / THE IDEA', '02 / YOUR WAREHOUSE', '03 / THE PROBLEM', '04 / THE SOLUTION', '05 / HOW IT WORKS', '06 / LET’S TALK'][state.chapter];
  }
  function render(now: number) {
    if (stopped || !visible) return;
    raf = requestAnimationFrame(render);
    if (!readyFired && !watchdog) arm();
    const frameDt = Math.max(0, (now - lastFrame) / 1000); lastFrame = now;
    // Under the contact section the last settled frame stays on screen as a still.
    if (covered && !settling && !fading && progress === renderedProgress) return;
    if (readyFired && document.querySelector('dialog[open]')) return;
    const busy = dirty || settling || fading || lensMoving || (swaying && !covered);
    const live = !reduced && (state.ambient > 0 || igniting || fade.connect > 0);
    if (!busy && !live) return;
    // Frames that only carry ambient life (a passing truck, a lamp warming up) run at 30 fps, 15 on the low tier.
    if (!busy && now - lastRender < (low ? 66 : 32)) return;
    // Exponential camera easing is safe with real elapsed time. Capping it made
    // a short camera move take many seconds on software-rendered devices.
    const dt = Math.max(0, (now - lastRender) / 1000); lastRender = now; renderedProgress = progress;
    if (settling && frameDt > .06) slowFrames++;
    else if (frameDt < .035) slowFrames = Math.max(0, slowFrames - 1);
    // RAF cadence includes GPU time; CPU submission timing alone misses a slow GPU.
    if (slowFrames >= 4 && highQuality) { highQuality = false; ao.enabled = bloom.enabled = false; renderer.setPixelRatio(1); renderer.setSize(width, height); }
    state = sampleTimeline(progress, reduced);
    rackFocus.update(state);
    if (!reduced) ambientTime += Math.min(dt, .1) * state.ambient;
    // The site switches on bank by bank on first arrival; deep links and reduced motion start lit.
    if (ignitedAt < 0) ignitedAt = reduced || progress > .5 ? 0 : now + 650;
    const lit = ignitedAt === 0 ? 99 : (now - ignitedAt) / 1000;
    igniting = false;
    for (const bank of banks) { const level = reduced ? 1 : ignition(lit - bank.delay); if (level < 1) igniting = true; setBank(bank, level); }
    host.dataset.lights = igniting ? 'igniting' : 'on';
    model.materials.signal.emissiveIntensity = reduced ? 2 : 2 * (1 + .3 * Math.sin(ambientTime * 2.4) * state.ambient);
    cameraGoal.set(...state.position); targetGoal.set(...state.target);
    // Frame the subject in the space between the heading and the reading card.
    const section = document.getElementById(['signal', 'warehouse', 'problems', 'forecast', 'decide', 'contact'][state.chapter]);
    const heading = section?.querySelector('.story-copy')?.getBoundingClientRect();
    const card = section?.querySelector('.story-card-deck')?.getBoundingClientRect();
    const top = heading ? Math.max(height * .2, Math.min(height * .38, heading.bottom + 16)) : height * .25;
    const bottom = card ? Math.max(top + 100, card.top - 12) : height * .8;
    let centerY = (top + bottom) / 2;
    const framing = mobile ? Math.max(1.35, height / Math.max(180, bottom - top) * .48) : 1;
    let scale = state.scale * framing;
    // The opening and the closing share one wide shot: low under the headline, high above the invitation.
    if (state.hero > 0) {
      // Desktop frames the model in the room under the hero copy (letting it tuck 50px behind the
      // hint). Calibrated so 1440×900 is the designed shot (×.9, centre at 84%); shorter screens
      // zoom out instead of cutting the warehouse off at the fold.
      const roomTop = (state.chapter === 0 && heading ? heading.bottom : height * .65) - 50, room = Math.max(120, height - roomTop);
      const heroScale = mobile ? 1.5 : Math.min(1.5, Math.max(.9, .9 * height / (2.466 * room)));
      const heroCenter = mobile ? height * .8 : Math.min(height * .9, Math.max(height * .74, roomTop + room * .6055));
      scale = mix(scale, state.scale * heroScale, state.hero); centerY = mix(centerY, heroCenter, state.hero);
    }
    if (state.finale > 0) { scale = mix(scale, state.scale * (mobile ? 1.45 : .95), state.finale); centerY = mix(centerY, height * (mobile ? .3 : .34), state.finale); }
    const distance = scale / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)));
    cameraGoal.sub(targetGoal).normalize().multiplyScalar(distance).add(targetGoal);
    const ease = reduced || !cameraInitialized ? 1 : 1 - Math.exp(-dt * 6.5);
    basePosition.lerp(cameraGoal, ease); cameraTarget.lerp(targetGoal, ease);
    cameraScale += (scale - cameraScale) * ease;
    const offsetGoal = height / 2 - centerY;
    cameraOffset += (offsetGoal - cameraOffset) * ease;
    cameraInitialized = true;
    settling = basePosition.distanceTo(cameraGoal) > .01 || cameraTarget.distanceTo(targetGoal) > .01 || Math.abs(scale - cameraScale) > .01 || Math.abs(cameraOffset - offsetGoal) > .1;
    const step = Math.min(dt, 1 / 30), goalX = reduced ? 0 : aimX, goalY = reduced ? 0 : aimY;
    swayVX += ((goalX - swayX) * 24 - swayVX * 9) * step; swayVY += ((goalY - swayY) * 24 - swayVY * 9) * step;
    swayX += swayVX * step; swayY += swayVY * step;
    swaying = Math.abs(goalX - swayX) + Math.abs(goalY - swayY) > .002 || Math.abs(swayVX) + Math.abs(swayVY) > .002;
    if (reduced) swayX = swayY = swayVX = swayVY = 0;
    // Up to 2° of orbit and 1.2° of tilt around the subject, so the model reads as a physical object.
    orbit.copy(basePosition).sub(cameraTarget).applyAxisAngle(UP, -swayX * .035);
    orbit.applyAxisAngle(side.crossVectors(orbit, UP).normalize(), swayY * .021);
    camera.position.copy(cameraTarget).add(orbit);
    camera.lookAt(cameraTarget);
    camera.aspect = width / height;
    camera.setViewOffset(width, height, 0, cameraOffset, width, height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    // X-ray lens: follows a mouse over the roof; otherwise a short demo visits A2, A3 and A4
    // (once on desktop, looping on touch screens). Off for reduced motion and outside the opening.
    const lensOn = !reduced && state.hero > .6, radius = mobile ? Math.min(78, width * .2) : Math.min(132, Math.max(84, width * .075));
    let aimLensR = 0, aimLensX = lensX, aimLensY = lensY, follow = 14;
    if (lensOn && pointerX >= 0 && roofHit(pointerX, pointerY)) {
      lensMode = 'pointer'; aimLensX = pointerX; aimLensY = pointerY; aimLensR = radius; lensRack = rackHit(pointerX, pointerY);
    } else if (lensOn && lensMode === 'demo' && !igniting) {
      if (demoAt < 0) demoAt = now + 900;
      const elapsed = (now - demoAt) / 1000, stop = Math.floor((fine ? elapsed : elapsed % (3 * 1.9 + 1.4)) / 1.9);
      if (elapsed >= 0 && stop < 3) {
        lensRack = stop + 1;
        projected.set(RACK_X[lensRack], 2.4, -1.5).project(camera);
        aimLensX = (projected.x + 1) / 2 * width; aimLensY = (1 - projected.y) / 2 * height; aimLensR = radius; follow = 5;
      }
    }
    if (aimLensR > 0 && lensR < 1) { lensX = aimLensX; lensY = aimLensY; }
    const lensStep = Math.min(dt, 1 / 30);
    lensV += ((aimLensR - lensR) * 150 - lensV * 17) * lensStep; lensR = Math.max(0, lensR + lensV * lensStep);
    if (aimLensR === 0 && lensR < .6) lensR = lensV = 0;
    const lensFollow = 1 - Math.exp(-dt * follow);
    lensX += (aimLensX - lensX) * lensFollow; lensY += (aimLensY - lensY) * lensFollow;
    lensMoving = Math.abs(aimLensR - lensR) > .4 || Math.abs(lensV) > .4 || (lensR > 0 && Math.hypot(aimLensX - lensX, aimLensY - lensY) > .4);
    lensUniform.value.set(lensX * composerRatio, (height - lensY) * composerRatio, lensR * composerRatio);
    // SSAO samples the shell's depth, which the lens has cut away, so it rests while the lens is open.
    ao.enabled = !mobile && highQuality && lensR === 0;
    model.roof.position.y = state.roof; model.roof.visible = state.roof < 12;
    model.frontWall.visible = state.wall < .99;
    fadingWalls.forEach(mat => { mat.opacity = 1 - state.wall; });
    wallMeshes.forEach(mesh => { mesh.castShadow = state.wall < .2; });
    const k = reduced ? 1 : 1 - Math.exp(-dt * 8);
    fading = false;
    const ease01 = (key: keyof typeof fade, show: boolean) => {
      const goal = show ? 1 : 0; let v = fade[key] + (goal - fade[key]) * k;
      if (Math.abs(goal - v) < .004) v = goal; else fading = true;
      return fade[key] = v;
    };
    model.stockOutline.visible = state.highlight > .1 && (state.label === 'problem' || (state.label === 'forecast' && state.solutionStep === 3) || state.label === 'decision');
    if (state.label === 'problem') {
      model.stockOutline.position.set(state.problemStep < 2 ? 2.4 : 10.8, 2.7, -2);
      model.stockOutline.scale.set(1, 3.1, 5.7);
    } else {
      model.stockOutline.position.set(6.6, 2.9, -2); model.stockOutline.scale.set(1, 1, 1);
    }
    const stockHighlight = (state.label === 'forecast' && state.solutionStep === 3) || state.label === 'decision' ? state.highlight : 0;
    highlightedStock.forEach(mat => { mat.color.copy(stockColor).lerp(activeColor, stockHighlight); mat.emissive.copy(activeColor); mat.emissiveIntensity = stockHighlight * .15; });
    (model.stockOutline.material as T.LineBasicMaterial).opacity = state.highlight;
    model.selectedStock.visible = state.pallet < .05;
    demandBatches.forEach(({ mesh, count }) => { mesh.count = Math.round(count * (1 - state.shortage)); });
    model.demandStock.visible = state.shortage < .99;
    const showTarget = ease01('target', state.label === 'forecast' && (state.solutionStep === 1 || state.solutionStep === 2));
    model.demandTarget.visible = showTarget > 0; targetMaterials.forEach(m => { m.opacity = .75 * showTarget; });
    model.demandTarget.scale.y = Math.max(.01, state.resolution);
    const showProposed = ease01('proposed', state.label === 'forecast' && state.solutionStep === 2);
    model.proposedStock.visible = showProposed > 0; model.materials.mint.opacity = .62 * showProposed;
    model.proposedStock.scale.y = Math.max(.01, state.replenishment);
    const showTransfer = ease01('transfer', state.label === 'forecast' && state.solutionStep === 3);
    model.transferGuide.visible = showTransfer > 0; transferMaterials.forEach(m => { m.opacity = showTransfer; });
    transferTube.setDrawRange(0, Math.ceil((transferTube.index?.count ?? 0) * showTransfer / 6) * 6);
    transferArrow.scale.setScalar(Math.max(.01, showTransfer));
    const showMarkdown = ease01('markdown', state.label === 'forecast' && state.solutionStep === 4);
    model.markdownZone.visible = showMarkdown > 0; markdownMaterial.opacity = showMarkdown; model.markdownZone.scale.y = .72 + .28 * showMarkdown;
    (model.stockOutline.material as T.LineBasicMaterial).color.set(state.progress < 3 ? '#ff723d' : '#a8e6ce');
    // Forklift follows clear aisle x=4.5, then the front cross aisle, to dock 02.
    const m = state.pallet;
    const moveZ = Math.min(1, m / .65), moveX = Math.max(0, (m - .65) / .35);
    model.lift.position.set(4.5 - moveX * 3.1, .5, -.8 + moveZ * 5.1);
    model.lift.rotation.y = moveX > 0 && moveX < 1 ? -Math.PI / 2 : 0;
    model.movingPallet.position.set(4.5 - moveX * 3.1, .7 + state.loading * .45, .55 + moveZ * 5.1 + state.loading * 2.3);
    model.movingPallet.visible = state.pallet >= .05 && state.loading < .98;
    model.lift.visible = true;
    const truckP = freightPath.getPoint(state.truck);
    model.deliveryTruck.position.set(truckP.x, .28, truckP.z);
    model.deliveryTruck.visible = state.progress < 5;
    tangent.copy(freightPath.getTangent(state.truck)); model.deliveryTruck.rotation.y = Math.atan2(tangent.x, tangent.z);
    route.visible = state.route > 0 && state.progress < 5;
    routeGeo.setDrawRange(0, Math.floor((routeGeo.index?.count ?? 0) * state.route / 6) * 6);
    // Signals: hero comets arrive once the site is lit; the connect beat's streams fade with the beat.
    if (!reduced) streamTime += Math.min(dt, .1);
    const pointScale = height * composerRatio / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)));
    heroStreams.update(streamTime, .9 * state.hero * Math.min(1, Math.max(0, (lit - 1.3) / 1.2)), pointScale);
    const showConnect = ease01('connect', state.label === 'forecast' && state.solutionStep === 0);
    connectStreams.update(streamTime, showConnect, pointScale);
    const beatT = (index: number, count: number, beat: number) => reduced ? 1 : Math.min(1, Math.max(0, (state.progress - index) / .86 * count - beat));
    const transferT = state.label === 'forecast' && state.solutionStep === 3 ? beatT(3, 5, 3) : 0;
    ghost.visible = showTransfer > .3;
    if (ghost.visible) { model.transferCurve.getPointAt(Math.min(1, transferT * 1.25), ghost.position); ghostMaterial.opacity = .75 * showTransfer; }
    const a = (ambientTime * .009 + .09) % 1;
    model.ambientTruck.position.copy(wheelsPath.getPointAt(a));
    tangent.copy(wheelsPath.getTangentAt(a)); model.ambientTruck.rotation.y = Math.atan2(tangent.x, tangent.z);
    model.ambientTruck.visible = state.ambient > .02;
    for (const [name, outline] of Object.entries(model.outlines)) outline.visible = state.label === 'warehouse' && state.progress < 1.4 && name === selected;
    projectLabels();
    // Data panels: one per problem/solution beat, scrubbed by progress through the beat.
    let panel: string | null = null, panelAnchor = A2, panelT = 0;
    if (state.label === 'problem') { panel = ['gap', 'out', 'slow'][state.problemStep]; panelAnchor = state.problemStep === 2 ? A4 : A2; panelT = beatT(2, 3, state.problemStep); }
    else if (state.label === 'forecast' && state.solutionStep > 0) {
      const beat = state.solutionStep;
      panel = ['forecast', 'order', 'transfer', 'markdown'][beat - 1]; panelAnchor = beat === 3 ? A3 : beat === 4 ? A4 : A2; panelT = beatT(3, 5, beat);
    }
    annotations.panel(camera, panel, panelAnchor, panelT, Math.max(88, (heading?.bottom ?? 80) + 12), card ? card.top - 12 : height - 60);
    annotations.racks(camera, rackAnchors, lensR > 0 && lensRack >= 0 ? { x: lensX, y: lensY, r: lensR, rack: lensRack } : state.label === 'warehouse' && state.progress >= 1.43 ? 'all' : 'off', Math.max(88, (heading?.bottom ?? 80) + 8));
    annotations.sources(camera, SOURCES, showConnect, Math.max(88, (heading?.bottom ?? 80) + 12), card ? card.top - 14 : height - 40);
    host.dataset.lens = lensR > 0 ? String(lensRack) : 'off';
    host.dataset.panel = panel ?? 'none';
    const before = performance.now(); renderer.info.reset(); renderer.info.autoReset = false; composer.render();
    const renderMs = performance.now() - before;
    renderedFrames++;
    // Ready means drawn, whichever path scheduled the frame (first request, tab revealed, resize).
    if (!readyFired) { readyFired = true; disarm(); performance.measure('campus:first-frame', { start: now, end: performance.now() }); onReady(); }
    // Ignore shader compilation; drop the extra AO pass on slower hosts, retaining direct shadows.
    if (renderedFrames > 5) { totalFrameMs += renderMs; measuredFrames++; }
    if (measuredFrames === 60 && totalFrameMs / measuredFrames > 14 && highQuality) {
      highQuality = false; ao.enabled = bloom.enabled = false; totalFrameMs = 0; measuredFrames = 0;
    }
    host.dataset.chapter = String(state.chapter);
    host.dataset.progress = progress.toFixed(3);
    host.dataset.cameraScale = cameraScale.toFixed(2);
    host.dataset.cameraSettled = String(!settling && !fading);
    host.dataset.drawCalls = String(renderer.info.render.calls);
    host.dataset.triangles = String(renderer.info.render.triangles);
    host.dataset.cpuRenderMs = (totalFrameMs / Math.max(1, measuredFrames)).toFixed(2);
    host.dataset.renderedFrames = String(renderedFrames);
    host.dataset.quality = ao.enabled ? 'enhanced' : 'standard';
    host.dataset.tier = low ? 'low' : 'high';
    host.dataset.ambient = state.ambient.toFixed(2);
    dirty = false;
  }
  const disarm = () => { clearTimeout(watchdog); watchdog = 0; };
  const fail = () => { stopped = true; cancelAnimationFrame(raf); disarm(); onFailure(); };
  // Armed by a frame callback, not by the request: a tab or window that is not drawing at all (hidden,
  // occluded, a paused embed) is never failed for it. Only a frame loop that runs but cannot draw is.
  const arm = () => { watchdog = window.setTimeout(() => { if (!readyFired && !stopped) { console.warn('Campus: no frame drawn; showing the HTML story.'); fail(); } }, FIRST_FRAME_TIMEOUT); };
  function visibility() { visible = !document.hidden; cancelAnimationFrame(raf); disarm(); if (visible && !stopped) { dirty = true; lastFrame = lastRender = performance.now(); raf = requestAnimationFrame(render); } }
  const lost = (e: Event) => { e.preventDefault(); fail(); };
  /**
   * Compiles every program the first frames use with KHR_parallel_shader_compile, in small slices,
   * so neither the compile nor the first draw blocks. Programs are shared by cache key, so stand-in
   * meshes warm the variants three.js creates internally: shadow depth and SSAO normals (plain and
   * instanced, lit by this scene) and the full-screen pass materials (unlit, into a render target).
   */
  async function warmUp() {
    const previous = renderer.getRenderTarget();
    const box = new T.BoxGeometry(), tri = new T.BufferGeometry();
    tri.setAttribute('position', new T.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    tri.setAttribute('uv', new T.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
    // Shadow depth takes the caster's side (flipped) and map, so textured casters need their own variant.
    const depth = new T.MeshDepthMaterial({ side: T.BackSide }), mappedDepth = new T.MeshDepthMaterial({ side: T.BackSide, map: model.materials.stone.map });
    const overrides = [depth, mappedDepth, ao.normalMaterial].flatMap(m => [new T.Mesh(box, m), new T.InstancedMesh(box, m, 1)]);
    const screen = new T.Group();
    for (const pass of [ao, bloom]) for (const value of Object.values(pass).flat()) if (value instanceof T.ShaderMaterial) screen.add(new T.Mesh(tri, value));
    // OutputPass sets its defines on its first render; these are the ones this renderer's settings produce.
    const outputWarm = output.material.clone(); outputWarm.defines = { SRGB_TRANSFER: '', ACES_FILMIC_TONE_MAPPING: '' };
    screen.add(new T.Mesh(tri, outputWarm));
    const lit: T.Object3D[] = [...overrides];
    scene.traverse(o => { if (o instanceof T.Mesh || o instanceof T.Points || o instanceof T.Line) lit.push(o); });
    const pending: Promise<unknown>[] = [];
    let slice = performance.now();
    renderer.setRenderTarget(composer.readBuffer);
    for (const object of lit) {
      // compile() traverses children too; already-built variants are cache hits.
      pending.push(renderer.compileAsync(object, camera, scene));
      if (performance.now() - slice > 12) { renderer.setRenderTarget(previous); await nextTask(); renderer.setRenderTarget(composer.readBuffer); slice = performance.now(); }
    }
    pending.push(renderer.compileAsync(screen, camera));
    renderer.setRenderTarget(previous);
    await Promise.all(pending);
    // A program's first use reads its link log and uniform table, a blocking GPU round trip each.
    slice = performance.now();
    for (const program of renderer.info.programs ?? []) {
      program.getUniforms(); program.getAttributes();
      if (performance.now() - slice > 12) { await nextTask(); slice = performance.now(); }
    }
    // Disposing a material releases its program, so the stand-in materials live as long as the engine.
    box.dispose(); tri.dispose();
    return [depth, mappedDepth, outputWarm];
  }
  const observer = new ResizeObserver(resize);
  resize();
  phase('scene');
  const standIns = await warmUp();
  phase('compile');
  renderer.domElement.addEventListener('webglcontextlost', lost);
  document.addEventListener('visibilitychange', visibility);
  if (fine) { window.addEventListener('pointermove', pointer, { passive: true }); document.documentElement.addEventListener('pointerleave', release); }
  observer.observe(host);
  // The tab may have been revealed or hidden during the boot, before the listener existed.
  visible = !document.hidden;
  if (visible) raf = requestAnimationFrame(render);
  return {
    update(p: number, calm: boolean, facility: Facility) { dirty = true; progress = p; reduced = calm; selected = facility; },
    /** Once the contact section reaches the top, the scene behind it is a still: finish settling, then stop drawing. */
    setCovered(next: boolean) { if (next !== covered) { covered = next; dirty = true; } },
    dispose() {
      stopped = true; cancelAnimationFrame(raf); disarm(); observer.disconnect(); document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pointermove', pointer); document.documentElement.removeEventListener('pointerleave', release);
      renderer.domElement.removeEventListener('webglcontextlost', lost);
      const geometries = new Set<T.BufferGeometry>(); const mats = new Set<T.Material>();
      scene.traverse(o => { if (o instanceof T.Mesh || o instanceof T.Line) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => mats.add(m)); } });
      geometries.forEach(g => g.dispose()); mats.forEach(m => { for (const value of Object.values(m)) if (value instanceof T.Texture) value.dispose(); m.dispose(); });
      heroStreams.dispose(); connectStreams.dispose(); standIns.forEach(m => m.dispose());
      ao.dispose(); bloom.dispose(); output.dispose(); composer.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
