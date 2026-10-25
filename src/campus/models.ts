import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Facility } from './timeline';

/**
 * Consistent metres throughout: 2.2m truck, 3m dock, 1.2m pallet, 2.2m aisles.
 * Built in slices: `pause` lets the page handle input and paint between them (parts are only
 * collected until the end, where they become instanced batches, so slicing changes nothing).
 */
export async function buildCampus(pause: () => Promise<void> = async () => {}) {
  const root = new T.Group();
  const roof = new T.Group();
  const frontWall = new T.Group();
  const selectedStock = new T.Group();
  const demandStock = new T.Group();
  const materials = {
    stone: new T.MeshStandardMaterial({ color: '#555650', roughness: .88 }),
    slab: new T.MeshStandardMaterial({ color: '#292b28', roughness: .92 }),
    road: new T.MeshStandardMaterial({ color: '#242725', roughness: .95 }),
    wall: new T.MeshStandardMaterial({ color: '#434640', roughness: .64, metalness: .32 }),
    roof: new T.MeshStandardMaterial({ color: '#62645f', roughness: .64, metalness: .3 }),
    frame: new T.MeshStandardMaterial({ color: '#252f2c', roughness: .5, metalness: .65 }),
    silver: new T.MeshStandardMaterial({ color: '#b0ada1', roughness: .38, metalness: .58 }),
    dark: new T.MeshStandardMaterial({ color: '#101715', roughness: .72 }),
    orange: new T.MeshStandardMaterial({ color: '#e65717', roughness: .42, metalness: .18 }),
    carton: new T.MeshStandardMaterial({ color: '#c9b795', roughness: .92 }),
    cream: new T.MeshStandardMaterial({ color: '#ddd6c5', roughness: .78 }),
    tape: new T.MeshStandardMaterial({ color: '#9a8b6c', roughness: .95 }),
    wood: new T.MeshStandardMaterial({ color: '#816744', roughness: .95 }),
    tyre: new T.MeshStandardMaterial({ color: '#121411', roughness: .98 }),
    glass: new T.MeshStandardMaterial({ color: '#31413d', roughness: .22, metalness: .65 }),
    window: new T.MeshStandardMaterial({ color: '#ad9d79', emissive: '#e6af67', emissiveIntensity: .15, roughness: .2, metalness: .25, transparent: true, opacity: .28, depthWrite: false }),
    lamp: new T.MeshStandardMaterial({ color: '#ffcf92', emissive: '#ffc179', emissiveIntensity: 1.8 }),
    // Separate circuits so the opening can switch the site on bank by bank.
    lampDock: new T.MeshStandardMaterial({ color: '#ffcf92', emissive: '#ffc179', emissiveIntensity: 1.8 }),
    lampOffice: new T.MeshStandardMaterial({ color: '#ffcf92', emissive: '#ffc179', emissiveIntensity: 1.8 }),
    lampStreet: new T.MeshStandardMaterial({ color: '#ffcf92', emissive: '#ffc179', emissiveIntensity: 1.8 }),
    signal: new T.MeshStandardMaterial({ color: '#ff6b21', emissive: '#ff4800', emissiveIntensity: 2 }),
    white: new T.MeshStandardMaterial({ color: '#d4d0bb', roughness: .8 }),
    leaf: new T.MeshStandardMaterial({ color: '#3b4430', roughness: 1, flatShading: true }),
    leaf2: new T.MeshStandardMaterial({ color: '#4b5139', roughness: 1, flatShading: true }),
    soil: new T.MeshStandardMaterial({ color: '#282d20', roughness: 1 }),
    mint: new T.MeshStandardMaterial({ color: '#9ee5c9', emissive: '#73cba6', emissiveIntensity: .2, roughness: .6, transparent: true, opacity: .62, depthWrite: false }),
  };
  // Fine, deterministic surface grain keeps close shots from reading as plastic blocks.
  function grain(base: string, strength: number, repeat: number) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = base; ctx.fillRect(0, 0, 128, 128);
    let seed = 81;
    for (let i = 0; i < 6500; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const x = seed % 128, y = (seed >>> 8) % 128;
      ctx.fillStyle = `rgba(${i % 2 ? '255,255,255' : '0,0,0'},${strength})`;
      ctx.fillRect(x, y, 1, i % 3 === 0 ? 2 : 1);
    }
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
    texture.wrapS = texture.wrapT = T.RepeatWrapping; texture.repeat.set(repeat, repeat);
    texture.anisotropy = 4; return texture;
  }
  materials.stone.map = grain('#e2e0d9', .08, 9);
  materials.road.map = grain('#c9cecc', .16, 12);
  materials.carton.map = grain('#f4ecdc', .07, 1);
  type Mat = keyof typeof materials;
  const boxGeo = new T.BoxGeometry(1, 1, 1);
  const bevelGeo = new RoundedBoxGeometry(1, 1, 1, 2, .045);
  const cylinderGeo = new T.CylinderGeometry(1, 1, 1, 12);
  const foliageGeo = new T.IcosahedronGeometry(1, 1);
  const groups = new Set<T.Group>([root, roof, frontWall, selectedStock]);
  const buckets = new Map<T.Group, Map<string, { geo: T.BufferGeometry; mat: T.Material; matrices: T.Matrix4[] }>>();
  const dummy = new T.Object3D();
  function add(g: T.Group, geo: T.BufferGeometry, m: Mat, x: number, y: number, z: number, sx: number, sy: number, sz: number, rz = 0, ry = 0, rx = 0) {
    groups.add(g);
    if (!buckets.has(g)) buckets.set(g, new Map());
    const key = geo.uuid + m;
    if (!buckets.get(g)!.has(key)) buckets.get(g)!.set(key, { geo, mat: materials[m], matrices: [] });
    dummy.position.set(x, y, z); dummy.rotation.set(rx, ry, rz); dummy.scale.set(sx, sy, sz); dummy.updateMatrix();
    buckets.get(g)!.get(key)!.matrices.push(dummy.matrix.clone());
  }
  const box = (g: T.Group, m: Mat, x: number, y: number, z: number, w: number, h: number, d: number, bevel = false, ry = 0) => add(g, bevel ? bevelGeo : boxGeo, m, x, y, z, w, h, d, 0, ry);
  const cylinder = (g: T.Group, m: Mat, x: number, y: number, z: number, r: number, h: number, rz = 0) => add(g, cylinderGeo, m, x, y, z, r, h, r, rz);
  function beam(g: T.Group, m: Mat, a: T.Vector3, b: T.Vector3, thickness = .06) {
    dummy.position.copy(a).add(b).multiplyScalar(.5); dummy.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    dummy.scale.set(thickness, a.distanceTo(b), thickness); dummy.updateMatrix();
    if (!buckets.has(g)) buckets.set(g, new Map());
    const key = boxGeo.uuid + m;
    if (!buckets.get(g)!.has(key)) buckets.get(g)!.set(key, { geo: boxGeo, mat: materials[m], matrices: [] });
    buckets.get(g)!.get(key)!.matrices.push(dummy.matrix.clone());
  }
  function sign(text: string, x: number, y: number, z: number, w: number, h: number, ry = 0, g = root) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#292c28'; ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#eee9dc'; ctx.font = '600 62px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 256, 65);
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
    const mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex, roughness: .8 }));
    mesh.position.set(x, y, z); mesh.rotation.y = ry; g.add(mesh);
  }
  // Continuous island, road loop, pedestrian pavements, and subtle expansion joints.
  box(root, 'slab', 0, -.7, 0, 44, 1.3, 37, true);
  box(root, 'road', 0, -.01, 0, 43.7, .16, 36.7, true);
  sign('S A N K E T', -5, -.67, 18.51, 7, .75);
  box(root, 'stone', 0, .12, -1, 34.5, .22, 25.5, true);
  for (let x = -20; x <= 20; x += 2) for (const z of [-16.4, 16.3]) box(root, 'white', x, .085, z, .8, .015, .045);
  for (let z = -14; z <= 14; z += 2) for (const x of [-19.4, 19.4]) box(root, 'white', x, .085, z, .045, .015, .8);
  for (const x of [-17.4, 17.4]) box(root, 'cream', x, .19, -1, .13, .15, 25.6);
  for (const z of [-13.8, 11.8]) box(root, 'cream', 0, .19, z, 34.8, .15, .13);
  for (let x = -16; x < 17; x += 2) box(root, 'slab', x, .245, -1, .018, .006, 25);
  for (let z = -12; z < 12; z += 2) box(root, 'slab', 0, .245, z, 34, .006, .018);
  for (let x = -13; x < -7; x += .55) box(root, 'white', x, .09, 14, .26, .014, 3.5);
  // Main warehouse: 18 x 13 metres, with true dock apertures and removable upper facade.
  box(root, 'stone', 5, .35, -.5, 18.5, .3, 13.5, true);
  box(root, 'wall', 5, 3.5, -7, 18, 6.2, .22);
  box(root, 'wall', -4, 3.5, -.5, .22, 6.2, 13);
  box(frontWall, 'wall', 14, 3.5, -.5, .22, 6.2, 13);
  box(frontWall, 'wall', 5, 5.5, 6, 18, 2.2, .24);
  for (let x = -4; x <= 14; x += 1) {
    box(root, 'silver', x, 3.5, -7.13, .028, 6, .028);
    box(frontWall, 'frame', x, 5.5, 6.14, .035, 2.1, .035);
  }
  // Service band and high clerestory glazing along the retained rear wall.
  for (let x = -2.8; x < 14; x += 2.4) {
    box(root, 'frame', x, 5.65, -6.86, 1.95, .76, .08);
    box(root, 'glass', x, 5.65, -6.8, 1.8, .61, .04);
    box(root, 'silver', x, 5.65, -6.76, .045, .65, .04);
  }
  for (const y of [1.3, 4.95]) box(root, 'silver', 5, y, -6.8, 17.7, .035, .06);
  for (let z = -6.7; z < 6; z += .5) box(frontWall, 'silver', 14.13, 3.5, z, .025, 6, .025);
  for (let x = -4; x <= 14; x += 3.6) {
    box(frontWall, 'wall', x, 2.35, 6, .65, 4, .45, true);
    box(root, 'silver', x, 3.6, -6.8, .15, 6.4, .18);
    box(frontWall, 'silver', x, 3.6, 5.8, .15, 6.4, .18);
    box(roof, 'silver', x, 6.65, -.5, .16, .24, 13);
    for (let z = -6; z < 6; z += 3) beam(roof, 'silver', new T.Vector3(x, 6.65, z), new T.Vector3(x, 6.1, z + 1.5), .07);
  }
  for (let i = 0; i < 5; i++) {
    const x = -2.2 + i * 3.6;
    box(root, 'dark', x, .55, 6.6, 2.9, .3, 1.1, true);
    box(frontWall, 'frame', x, 4.2, 6.14, 3.05, .18, .25);
    for (const dx of [-1.48, 1.48]) {
      box(frontWall, 'frame', x + dx, 2.35, 6.18, .16, 3.6, .23);
      cylinder(root, 'orange', x + dx, .85, 6.65, .07, 1.1);
      for (let y = .5; y < 1.35; y += .3) cylinder(root, 'dark', x + dx, y, 6.65, .075, .09);
    }
    box(frontWall, 'lampDock', x, 4.3, 6.3, 1.2, .05, .13);
    box(frontWall, 'signal', x + 1.22, 3.8, 6.28, .1, .14, .08);
    sign(`0${i + 1}`, x, 4.8, 6.16, .9, .24, 0, frontWall);
    for (const dx of [-1.5, 1.5]) box(root, 'white', x + dx, .262, 9.6, .035, .014, 5.8);
    if (i !== 1 && i !== 3) {
      box(frontWall, 'silver', x, 2.35, 6, 2.85, 3.5, .1);
      for (let y = .7; y < 4; y += .19) box(frontWall, 'frame', x, y, 6.07, 2.8, .017, .012);
    }
  }
  // Roof assembly stays attached to the exact warehouse footprint.
  box(roof, 'roof', 5, 6.95, -.5, 18.7, .24, 13.7, true);
  for (let x = -4; x <= 14; x += .52) box(roof, 'silver', x, 7.09, -.5, .035, .04, 13.5);
  for (const z of [-7.3, 6.3]) box(roof, 'cream', 5, 7.1, z, 18.7, .12, .08);
  for (const x of [-4.3, 14.3]) box(roof, 'cream', x, 7.1, -.5, .08, .12, 13.7);
  function hvac(g: T.Group, x: number, y: number, z: number) {
    box(g, 'silver', x, y, z, 1.25, .65, .9, true);
    for (const dx of [-.33, .33]) { cylinder(g, 'dark', x + dx, y + .34, z, .24, .04); cylinder(g, 'frame', x + dx, y + .38, z, .06, .025); }
    for (let h = -.2; h < .25; h += .1) box(g, 'frame', x, y + h, z + .46, 1.05, .02, .02);
  }
  for (const x of [-1, 10]) for (const z of [-4, 3]) hvac(roof, x, 7.45, z);
  for (const x of [2, 6]) for (const z of [-3, 2]) { box(roof, 'frame', x, 7.15, z, 2.4, .12, .9); box(roof, 'glass', x, 7.23, z, 2.25, .08, .75); }
  // Warm perimeter fixtures. Only two real lights; emissive strips carry the detail.
  for (let z = -5; z <= 5; z += 2.5) {
    box(root, 'lamp', -3.84, 5.7, z, .05, .12, .7);
    box(frontWall, 'lamp', 14.16, 5, z, .05, .12, .7);
  }
  // Connected glazed office, concrete slabs, mullions, desks and tiny screens.
  box(root, 'wall', -8, 2.8, -1, 6, 5.2, .15, true);
  box(root, 'wall', -5, 2.8, 3, .15, 5.2, 8, true);
  for (const y of [1.5, 4]) {
    box(root, 'window', -8, y, 7.02, 5.7, 2, .04);
    box(root, 'window', -11.02, y, 3, .04, 2, 7.7);
    box(root, 'glass', -4.98, y, 3, .04, 2, 7.7);
    for (let x = -10.5; x < -5; x += 1.1) box(root, 'frame', x, y, 7.06, .07, 2.2, .08);
    for (let z = -.5; z < 7; z += 1.1) box(root, 'frame', -11.06, y, z, .08, 2.2, .07);
    for (let x = -10; x < -5; x += 1.6) {
      box(root, 'wood', x, y - .3, 6.7, .9, .07, .55);
      box(root, 'dark', x, y + .05, 6.7, .35, .28, .05);
      box(root, 'lampOffice', x, y + .05, 6.735, .28, .2, .01);
      for (const dx of [-.35, .35]) box(root, 'frame', x + dx, y - .65, 6.7, .045, .65, .045);
      box(root, 'dark', x, y - .25, 6, .4, .1, .4, true);
      box(root, 'dark', x, y, 5.85, .4, .5, .08, true);
    }
  }
  for (const y of [.4, 2.65, 5.25]) box(root, 'roof', -8, y, 3, 6.4, .18, 8.4);
  for (const y of [2.5, 5.1]) for (const z of [1, 4, 6]) box(root, 'lampOffice', -8, y, z, 3.8, .025, .08);
  for (let x = -10.9; x <= -5; x += 1.18) box(root, 'frame', x, 2.8, 7.1, .09, 5.2, .1);
  hvac(root, -8, 5.7, 2); hvac(root, -8, 5.7, 5);
  box(root, 'wall', -4.6, 2.1, 1, .8, 3.8, 2);
  sign('S A N K E T', -8, 5.65, 7.24, 4.7, .6);
  for (const x of [-9.4, -6.4]) {
    box(root, 'silver', x, .73, 9.5, 1.4, .55, 2.8, true);
    box(root, 'glass', x, 1.1, 9.4, 1.2, .55, 1.4, true);
    box(root, 'wall', x, 1.4, 9.4, 1.24, .08, 1.45, true);
    for (const dx of [-.68, .68]) for (const dz of [-.88, .88]) cylinder(root, 'tyre', x + dx, .54, 9.5 + dz, .24, .14, Math.PI / 2);
    for (const dx of [-.48, .48]) box(root, 'lampStreet', x + dx, .79, 10.93, .25, .08, .03);
  }
  // Factory: articulated volumes, saw-tooth services, silos and pipework.
  box(root, 'wall', -9, 2.2, -8.5, 9, 3.9, 6, true);
  box(root, 'roof', -9, 4.2, -8.5, 9.3, .22, 6.3, true);
  box(root, 'wall', -6, 3, -10, 2.5, 5.5, 3.8, true);
  for (let x = -12.5; x < -5; x += 1.2) {
    box(root, 'window', x, 2.4, -5.46, .75, .9, .04);
    box(root, 'frame', x, 2.4, -5.4, .045, 1, .06);
    box(root, 'wall', x, 2.3, -5.35, .13, 4, .18);
  }
  for (const x of [-14.3, -12.6, -10.9]) {
    cylinder(root, 'silver', x, 2.8, -11.9, .72, 4.8);
    cylinder(root, 'roof', x, 5.25, -11.9, .75, .12);
    for (const y of [1.1, 2.5, 4]) cylinder(root, 'frame', x, y, -11.9, .735, .045);
    cylinder(root, 'frame', x, 5.6, -11.9, .12, .7);
  }
  cylinder(root, 'wall', -6.5, 6.3, -10, .4, 7);
  for (const y of [7, 9.4]) cylinder(root, 'signal', -6.5, y, -10, .412, .07);
  for (let x = -12; x < -7; x += 1.5) hvac(root, x, 4.65, -8.5);
  sign('MANUFACTURING', -9, 3.7, -5.34, 4.1, .4);
  // Dispatch canopy and fenced staging apron, clear of the road loop.
  box(root, 'roof', 12.7, 3.8, 10.1, 4.9, .22, 2.4, true);
  for (const x of [10.4, 15]) for (const z of [9, 11.2]) box(root, 'frame', x, 2, z, .12, 3.5, .12);
  sign('DISPATCH', 12.7, 3.45, 11.34, 3, .42);
  for (let x = 11.2; x < 15; x += 1.5) { box(root, 'dark', x, .55, 10, 1.2, .6, .9, true); box(root, 'tape', x, .87, 10, .1, .03, .92); }
  await pause();
  // Landscape is quiet, deterministic and scaled to the campus.
  function tree(x: number, z: number, n: number) {
    box(root, 'cream', x, .3, z, 1.5, .2, 1.5, true); box(root, 'soil', x, .41, z, 1.3, .04, 1.3);
    cylinder(root, 'wood', x, 1.1, z, .1, 1.5);
    for (let j = 0; j < 5; j++) {
      const angle = j * 2.4 + n;
      add(root, foliageGeo, j % 2 ? 'leaf' : 'leaf2', x + Math.cos(angle) * .35, 2 + j * .19, z + Math.sin(angle) * .35, .65, .8, .65, 0, angle);
    }
  }
  [[-15, 8], [-15, 4], [-15, 0], [-15, -4], [16, -10], [16, -5], [16, 0], [16, 5], [-3, 10], [-12, 10], [3, -12], [8, -12], [13, -12]].forEach(([x, z], n) => tree(x, z, n));
  function streetLamp(x: number, z: number) {
    cylinder(root, 'frame', x, 2.5, z, .055, 4.8); box(root, 'frame', x + .3, 4.9, z, .65, .055, .07);
    box(root, 'lampStreet', x + .5, 4.86, z, .3, .055, .14);
  }
  [[-16, -7], [-16, 7], [16.5, -7], [16.5, 7], [-5, 12], [5, 12], [-17, -13], [10, -13]].forEach(([x, z]) => streetLamp(x, z));
  // Actual slatted pallets and individually strapped cartons.
  function pallet(g: T.Group, x: number, y: number, z: number, accent = false, boxes = true) {
    for (const dx of [-.48, 0, .48]) box(g, 'wood', x + dx, y + .08, z, .13, .15, 1.05);
    for (let dz = -.45; dz <= .45; dz += .18) box(g, 'wood', x, y + .19, z + dz, 1.2, .08, .13);
    if (boxes) for (const dx of [-.29, .29]) for (const dz of [-.24, .24]) {
      box(g, accent ? 'orange' : 'carton', x + dx, y + .62, z + dz, .55, .76, .45, true);
      box(g, 'tape', x + dx, y + 1.008, z + dz, .055, .01, .46);
      box(g, 'cream', x + dx, y + .65, z + dz + .233, .2, .12, .008);
      for (let line = 0; line < 5; line++) box(g, 'dark', x + dx - .065 + line * .026, y + .65, z + dz + .239, line % 2 ? .009 : .014, .075, .005);
    }
  }
  await pause();
  // Rack rows leave 2.2m clear aisles; each bay supports a 1.2m pallet.
  for (const x of [-1.8, 2.4, 6.6, 10.8]) for (let b = 0; b < 5; b++) {
    const z = -5.5 + b * 1.75;
    for (const dx of [-.73, .73]) for (const dz of [-.83, .83]) {
      box(root, 'frame', x + dx, 2.6, z + dz, .075, 4.6, .075);
      box(root, 'orange', x + dx, .65, z + dz, .1, .6, .1);
    }
    for (const y of [.6, 2.1, 3.6]) {
      for (const dx of [-.73, .73]) box(root, 'orange', x + dx, y, z, .07, .11, 1.7);
      box(root, 'silver', x, y, z, 1.4, .06, 1.62);
      pallet(x === 2.4 ? demandStock : x === 6.6 && b === 2 && y === 2.1 ? selectedStock : root, x, y + .05, z, (b + Math.round(x)) % 7 === 0);
    }
    for (const dz of [-.83, .83]) for (const y of [.7, 2.2]) beam(root, 'silver', new T.Vector3(x - .7, y, z + dz), new T.Vector3(x + .7, y + 1.35, z + dz), .025);
  }
  // Human-scale rack IDs, end guards and picking labels survive the roof cutaway.
  for (const [i, x] of [-1.8, 2.4, 6.6, 10.8].entries()) {
    sign(`A${i + 1}`, x, 4.94, 2.48, 1.1, .36);
    for (const dx of [-.82, .82]) {
      cylinder(root, 'orange', x + dx, .87, 2.62, .065, .7);
      cylinder(root, 'dark', x + dx, .99, 2.62, .069, .12);
    }
    beam(root, 'orange', new T.Vector3(x - .8, .92, 2.62), new T.Vector3(x + .8, .92, 2.62), .075);
    for (const y of [.64, 2.14, 3.64]) {
      box(root, 'cream', x, y, 2.4, .45, .13, .025);
      for (let j = 0; j < 4; j++) box(root, 'dark', x - .12 + j * .07, y, 2.416, .025, .07, .01);
    }
  }
  // A pedestrian crossing, staged pallets and wall-mounted safety equipment.
  for (let x = -2.5; x < 13; x += .65) box(root, 'cream', x, .515, 3.45, .28, .012, 1);
  for (const x of [-3.7, 13.6]) {
    cylinder(root, 'orange', x, 1.15, -6.6, .12, .55);
    box(root, 'silver', x, 1.49, -6.6, .2, .06, .09);
    box(root, 'cream', x, 1.92, -6.77, .35, .38, .02);
  }
  // Safety lines, overhead beams and fixtures frame the internal circulation space.
  for (const x of [.3, 4.5, 8.7]) for (const dx of [-.95, .95]) box(root, 'orange', x + dx, .51, -.8, .025, .01, 11.3);
  for (const z of [-5.5, -.5, 4.5]) {
    box(roof, 'silver', 5, 6.5, z, 18, .2, .12);
    for (const x of [0, 5, 10]) box(roof, 'lamp', x, 6.35, z, 1.3, .05, .17);
  }
  // Conveyor and packing station at the back edge, away from vehicle aisles.
  box(root, 'frame', 5, .95, -6.4, 8, .2, .7);
  for (let x = 1; x < 9; x += .18) cylinder(root, 'silver', x, 1.1, -6.4, .055, .65, Math.PI / 2);
  for (const x of [1, 4, 8]) box(root, 'frame', x, .7, -6.4, .08, .6, .6);
  await pause();
  // Trucks have chassis, cab glazing, mirrors, corrugated trailer and wheel hubs.
  function truck(x: number, z: number, rotation = 0) {
    const g = new T.Group(); root.add(g); g.position.set(x, .28, z); g.rotation.y = rotation;
    box(g, 'frame', 0, .55, 0, 1.8, .24, 6.8, true);
    box(g, 'cream', 0, 1.65, -1, 2.15, 2.1, 4.9, true);
    box(g, 'orange', 0, 1.4, 2.55, 2.12, 1.9, 1.6, true);
    box(g, 'glass', 0, 1.85, 3.37, 1.85, .7, .04);
    box(g, 'orange', 0, 2.45, 2.5, 2.15, .2, 1.7, true);
    for (const dx of [-1.075, 1.075]) {
      box(g, 'glass', dx, 1.85, 2.6, .035, .65, 1.1);
      box(g, 'frame', dx * 1.1, 1.75, 3.3, .15, .24, .1, true);
      box(g, 'silver', dx, .8, 2.55, .1, .12, .7);
      for (let dz = -3.2; dz < 1.4; dz += .18) box(g, 'silver', dx, 1.7, dz, .018, 1.9, .025);
    }
    box(g, 'dark', 0, .95, 3.38, 1.5, .25, .05);
    for (const dx of [-.8, .8]) { box(g, 'lampDock', dx, 1.06, 3.4, .26, .13, .055); box(g, 'signal', dx, .72, -3.48, .13, .13, .05); }
    for (const dz of [-2.8, -1.9, 2.7]) for (const dx of [-1.05, 1.05]) {
      cylinder(g, 'tyre', dx, .49, dz, .43, .23, Math.PI / 2);
      cylinder(g, 'silver', dx * 1.12, .49, dz, .22, .025, Math.PI / 2);
    }
    return g;
  }
  const deliveryTruck = truck(1.4, 10);
  truck(8.6, 10); const ambientTruck = truck(-8, 16.2, Math.PI / 2);
  function forklift(x: number, z: number) {
    const g = new T.Group(); root.add(g); g.position.set(x, .5, z);
    box(g, 'orange', 0, .55, 0, .95, .65, 1.45, true);
    box(g, 'dark', 0, 1, -.2, .48, .2, .5, true); box(g, 'dark', 0, 1.2, -.43, .48, .5, .12, true);
    for (const dx of [-.43, .43]) for (const dz of [-.5, .5]) box(g, 'frame', dx, 1.35, dz, .055, 1.5, .055);
    box(g, 'frame', 0, 2.1, 0, 1.05, .1, 1.25);
    for (const dx of [-.3, .3]) { box(g, 'frame', dx, 1.05, .82, .08, 2, .11); box(g, 'silver', dx, .2, 1.25, .1, .07, .9); }
    for (const dx of [-.5, .5]) for (const dz of [-.5, .5]) cylinder(g, 'tyre', dx, .3, dz, .27, .16, Math.PI / 2);
    // Driver with hardhat and vest.
    box(g, 'orange', 0, 1.28, 0, .32, .42, .25, true); cylinder(g, 'cream', 0, 1.65, 0, .13, .21); cylinder(g, 'white', 0, 1.79, 0, .17, .08);
    return g;
  }
  const lift = forklift(4.5, -.8); forklift(12.8, 3.8).rotation.y = -Math.PI / 2;
  const movingPallet = new T.Group(); root.add(movingPallet); pallet(movingPallet, 0, 0, 0, true);
  // Scene selection outlines are geometry, with no new render passes.
  const outlines = {} as Record<Facility, T.LineSegments>;
  const definitions: [Facility, number, number, number, number, number, number][] = [
    ['warehouse', 5, 3.7, -.5, 18.6, 6.6, 13.6], ['office', -8, 2.9, 3, 6.5, 5.7, 8.5],
    ['factory', -9, 2.5, -8.5, 9.5, 4.5, 6.5], ['dispatch', 12.7, 2.1, 10.1, 4.9, 4, 2.8],
  ];
  for (const [name, x, y, z, w, h, d] of definitions) {
    const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w, h, d)), new T.LineBasicMaterial({ color: '#ff702d', transparent: true, opacity: .65 }));
    edge.position.set(x, y, z); edge.visible = false; root.add(edge); outlines[name] = edge;
  }
  const stockOutline = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1.6, 1.4, 1.55)), new T.LineBasicMaterial({ color: '#ff742b', transparent: true, opacity: 1 }));
  stockOutline.position.set(6.6, 2.9, -2); root.add(stockOutline);
  const demandTarget = new T.Group();
  for (let b = 0; b < 5; b++) {
    const edge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1.4, 4.3, 1.5)), new T.LineBasicMaterial({ color: '#a8e6ce', transparent: true, opacity: .75 }));
    edge.position.set(2.4, 2.8, -5.5 + b * 1.75); demandTarget.add(edge);
  }
  root.add(roof, frontWall, selectedStock, demandStock, demandTarget);
  const transferGuide = new T.Group();
  const transferCurve = new T.CatmullRomCurve3([[6.6, 5.5, -2], [5, 7, 0], [2, 5.5, 4], [1.4, 1, 6]].map(v => new T.Vector3(...v as [number, number, number])));
  transferGuide.add(new T.Mesh(new T.TubeGeometry(transferCurve, 40, .035, 5, false), new T.MeshBasicMaterial({ color: '#a8e6ce' })));
  const arrow = new T.Mesh(new T.ConeGeometry(.23, .65, 16), new T.MeshBasicMaterial({ color: '#a8e6ce' }));
  arrow.position.set(1.4, 1, 6); arrow.rotation.z = Math.PI; transferGuide.add(arrow); root.add(transferGuide);
  const markdownZone = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1.7, 4.7, 8.9)), new T.LineBasicMaterial({ color: '#f3bd73' }));
  markdownZone.position.set(10.8, 2.8, -2); root.add(markdownZone);
  await pause();
  // Collapse thousands of repeated structural parts into instanced batches per moving assembly.
  for (const [g, parts] of buckets) for (const { geo, mat, matrices } of parts.values()) {
    const mesh = new T.InstancedMesh(geo, mat, matrices.length);
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.castShadow = !(['lamp', 'lampDock', 'lampOffice', 'lampStreet', 'signal'] as Mat[]).some(key => materials[key] === mat);
    mesh.receiveShadow = true; mesh.computeBoundingSphere(); g.add(mesh);
  }
  const proposedStock = new T.Group();
  demandStock.traverse(o => {
    if (!(o instanceof T.InstancedMesh) || o.material !== materials.carton) return;
    const mesh = new T.InstancedMesh(o.geometry, materials.mint, o.count);
    mesh.instanceMatrix.copy(o.instanceMatrix); mesh.computeBoundingSphere(); proposedStock.add(mesh);
  });
  root.add(proposedStock);
  return { root, demandStock, demandTarget, proposedStock, transferGuide, transferCurve, markdownZone, roof, frontWall, selectedStock, stockOutline, movingPallet, lift, deliveryTruck, ambientTruck, outlines, materials };
}
