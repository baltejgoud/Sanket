import * as T from 'three';
import type { TimelineState } from './timeline';

/** A floor projection, rather than another floating UI, connects the explanation to its rack. */
export function createRackFocus() {
  const group = new T.Group();
  const geometry = new T.PlaneGeometry(3.1, 10.6);
  const orange = new T.Color('#ff7540'), mint = new T.Color('#a8e6ce'), amber = new T.Color('#e9b96e');
  const materials = [-1.8, 2.4, 6.6, 10.8].map(x => {
    const material = new T.ShaderMaterial({
      uniforms: { uColor: { value: mint.clone() }, uOpacity: { value: 0 }, uStock: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uOpacity; uniform float uStock;
        void main() {
          vec2 p = abs(vUv - .5) * 2.;
          float edge = max(p.x, p.y);
          float wash = (1. - smoothstep(.55, 1., edge)) * .09;
          float border = smoothstep(.94, .96, edge) * (1. - smoothstep(.985, 1., edge));
          float corners = step(.78, min(p.x, p.y));
          float dashes = step(.6, fract((vUv.x + vUv.y) * 42.));
          float frame = border * max(corners, dashes * .3);
          float meter = step(.035, vUv.y) * (1. - step(.068, vUv.y)) * step(.1, vUv.x) * (1. - step(.9, vUv.x));
          float fill = step(vUv.x, .1 + .8 * uStock);
          float a = (wash + frame * .7 + meter * (.18 + fill * .72)) * uOpacity;
          if (a < .005) discard;
          gl_FragColor = vec4(uColor, a);
        }`,
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    const plane = new T.Mesh(geometry, material);
    plane.rotation.x = -Math.PI / 2; plane.position.set(x, .53, -1.8);
    group.add(plane);
    return material;
  });
  return {
    group,
    update(state: TimelineState) {
      const problem = state.label === 'problem', solution = state.label === 'forecast';
      const overview = state.label === 'warehouse' && state.roof > 7;
      const active = problem ? (state.problemStep === 2 ? 3 : 1) : solution ? (state.solutionStep === 3 ? 2 : state.solutionStep === 4 ? 3 : 1) : state.label === 'decision' ? 2 : -1;
      const focusColor = problem ? active === 3 ? amber : orange : solution && state.solutionStep === 4 ? amber : mint;
      materials.forEach((m, i) => {
        const on = overview || i === active;
        m.uniforms.uOpacity.value = on ? overview ? .5 : .95 : 0;
        m.uniforms.uColor.value.copy(overview ? i === 1 ? orange : i === 3 ? amber : mint : focusColor);
        m.uniforms.uStock.value = i === 1 ? solution && state.solutionStep === 2 ? state.replenishment : 1 - state.shortage : 1;
        group.children[i].visible = on;
      });
    },
  };
}
