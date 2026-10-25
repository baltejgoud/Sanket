import * as T from 'three';

const TRAIL = 3, SAMPLES = 64;

/**
 * Signals drawn as comets of light along curves: one draw call, positions stepped on the CPU from
 * arc-length tables (a few hundred points), additive so the bloom pass makes them glow.
 */
export function createStreams(curves: T.Curve<T.Vector3>[], color: string, perCurve: number, size: number) {
  const tables = curves.map(c => c.getSpacedPoints(SAMPLES));
  const seeds = Array.from({ length: curves.length * perCurve }, (_, i) => ({ curve: i % curves.length, phase: (i * .618034) % 1, speed: .09 + ((i * 7919) % 97) / 97 * .07 }));
  const count = seeds.length * TRAIL;
  const positions = new Float32Array(count * 3), alphas = new Float32Array(count), sizes = new Float32Array(count);
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
  geometry.setAttribute('aAlpha', new T.BufferAttribute(alphas, 1));
  geometry.setAttribute('aSize', new T.BufferAttribute(sizes, 1));
  const material = new T.ShaderMaterial({
    uniforms: { uColor: { value: new T.Color(color) }, uOpacity: { value: 0 }, uScale: { value: 1 } },
    vertexShader: `attribute float aAlpha; attribute float aSize; uniform float uScale; uniform float uOpacity; varying float vAlpha;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.); gl_Position = projectionMatrix * mv; gl_PointSize = aSize * uScale / -mv.z; vAlpha = aAlpha * uOpacity; }`,
    fragmentShader: `uniform vec3 uColor; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .05, d); if (a * vAlpha < .004) discard; gl_FragColor = vec4(uColor * (1. + 2.4 * a * a), a * vAlpha); }`,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending,
  });
  const points = new T.Points(geometry, material);
  points.frustumCulled = false; points.visible = false; points.renderOrder = 2;
  let drawnAt = NaN;
  return {
    points,
    /** time in seconds drives travel; opacity 0 hides the set; scale converts world size to pixels. */
    update(time: number, opacity: number, scale: number) {
      material.uniforms.uOpacity.value = opacity; material.uniforms.uScale.value = scale;
      points.visible = opacity > .002;
      if (!points.visible || time === drawnAt) return;
      drawnAt = time;
      seeds.forEach((s, i) => {
        const table = tables[s.curve];
        for (let k = 0; k < TRAIL; k++) {
          const u = (((s.phase + time * s.speed - k * .014) % 1) + 1) % 1;
          const f = u * SAMPLES, j = Math.floor(f), w = f - j, a = table[j], b = table[Math.min(SAMPLES, j + 1)];
          const o = i * TRAIL + k;
          positions[o * 3] = a.x + (b.x - a.x) * w; positions[o * 3 + 1] = a.y + (b.y - a.y) * w; positions[o * 3 + 2] = a.z + (b.z - a.z) * w;
          // Comets fade in at the source, out on arrival, and thin along the tail.
          alphas[o] = Math.pow(Math.sin(Math.PI * u), .7) * (1 - k * .34);
          sizes[o] = size * (1 - k * .24);
        }
      });
      geometry.attributes.position.needsUpdate = true; geometry.attributes.aAlpha.needsUpdate = true; geometry.attributes.aSize.needsUpdate = true;
    },
    dispose() { geometry.dispose(); material.dispose(); },
  };
}
