import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import { createField, FLAG_NEW } from "./model";

/**
 * The field as a USDZ model for Apple's AR viewer (iPhone/iPad "View in AR"): the unbalanced
 * state, every column at its real height and coloured by status, on a dark base, 45 cm wide and
 * anchored to horizontal surfaces. Built from the same model as the live scene; written to
 * public/assets/stock-field.usdz by scripts/render-field-usdz.mjs.
 */
export async function exportFieldUsdz() {
  const m = createField(36, 22);
  const colors = { short: "#ff5a1f", over: "#5b5d55", ok: "#c9c4b8", new: "#9fd8c9" } as const;
  const parts: Record<keyof typeof colors, THREE.BufferGeometry[]> = { short: [], over: [], ok: [], new: [] };
  for (let k = 0; k < m.count; k++) {
    const h = Math.max(0.04, m.stock0[k]);
    const ratio = m.stock0[k] / Math.max(m.stock1[k], 0.05);
    const status: keyof typeof colors = m.flags[k] & FLAG_NEW ? "new" : ratio < 0.5 ? "short" : ratio > 1.65 ? "over" : "ok";
    parts[status].push(new THREE.BoxGeometry(0.5, h, 0.5).translate(m.pos[k * 2], h / 2, m.pos[k * 2 + 1]));
  }
  const field = new THREE.Group();
  field.name = "StockField";
  for (const key of Object.keys(parts) as (keyof typeof colors)[]) {
    if (!parts[key].length) continue;
    const mesh = new THREE.Mesh(mergeGeometries(parts[key]), new THREE.MeshStandardMaterial({ color: colors[key], roughness: 0.85, metalness: 0 }));
    mesh.name = `Stock_${key}`;
    field.add(mesh);
  }
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(m.width + 1.4, 0.14, m.depth + 1.4).translate(0, -0.07, 0),
    new THREE.MeshStandardMaterial({ color: "#141613", roughness: 0.95, metalness: 0 }),
  );
  base.name = "Base";
  field.add(base);
  field.scale.setScalar(0.45 / (m.width + 1.4));
  const scene = new THREE.Scene();
  scene.add(field);
  const data = await new USDZExporter().parseAsync(scene, { quickLookCompatible: true });
  return new Uint8Array(data);
}
