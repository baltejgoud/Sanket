/* GLSL for the Stock Field. All state blending happens on the GPU from
   per-instance attributes, so a scroll update costs a few uniforms. */

const common = /* glsl */ `
uniform float uTime;
uniform float uIntro;
uniform float uSignal;
uniform float uForecast;
uniform float uDecide;
uniform float uLevel;
uniform vec4 uWaves[6];
uniform vec3 uPointer;
uniform vec4 uFocus;
uniform float uFocusAmt;
uniform vec2 uIntroOrigin;
uniform float uIntroReach;

float decideProgress(float decision, float delay) {
  vec2 w = decision < 0.5 ? vec2(0.0, 0.78)
         : decision < 1.5 ? vec2(0.0, 0.3)
         : decision < 2.5 ? vec2(0.24, 0.56)
         : vec2(0.5, 0.78);
  float local = (uDecide - w.x) / (w.y - w.x);
  return smoothstep(0.0, 1.0, (local - delay * 0.6) / 0.4);
}

float waves(vec2 p) {
  float acc = 0.0;
  for (int k = 0; k < 6; k++) {
    vec4 w = uWaves[k];
    float age = uTime - w.z;
    if (w.w <= 0.0 || age < 0.0 || age > 7.0) continue;
    float radius = age * 8.5;
    float d = distance(p, w.xy);
    float front = exp(-pow((d - radius) / 1.7, 2.0));
    acc += front * w.w * (1.0 - age / 7.0);
  }
  return acc;
}

float growth(vec2 p) {
  return smoothstep(0.0, 1.0, uIntro * 1.7 - distance(p, uIntroOrigin) / uIntroReach);
}

float focusMask(vec2 p) {
  return 1.0 - smoothstep(uFocus.z * 0.55, uFocus.z * 1.35, distance(p, uFocus.xy));
}
`;

/* The projector: a top-down parallel light casting a canvas onto the ground plane. `face` is how
   squarely the surface takes the light (tops 1, sides a streak, floor a spill). */
const projection = /* glsl */ `
uniform sampler2D uProjTex;
uniform vec4 uProjRect; // minX, minZ, sizeX, sizeZ
uniform vec3 uProjMask;
uniform vec3 uProjColor;
uniform float uProjAmt;
vec3 projected(vec2 xz, float face) {
  if (uProjAmt <= 0.001) return vec3(0.0);
  vec2 uv = (xz - uProjRect.xy) / uProjRect.zw;
  uv.y = 1.0 - uv.y;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec3(0.0);
  float light = clamp(dot(texture2D(uProjTex, uv).rgb, uProjMask), 0.0, 1.0);
  return uProjColor * light * face * uProjAmt;
}
`;

export const columnVertex = /* glsl */ `
${common}
attribute vec4 aA; // x, z, stock0, stock1
attribute vec4 aB; // lo, hi, decision, delay
attribute vec2 aC; // seed, flags
uniform float uColSize;
varying vec3 vNormal;
varying vec2 vUv;
varying float vY;
varying float vShort;
varying float vExcess;
varying float vWave;
varying float vFocus;
varying float vDepth;
varying float vHover;
varying float vNew;
varying float vHeight;
varying vec3 vObj;

void main() {
  vec2 p = aA.xy;
  float pr = decideProgress(aB.z, aB.w);
  float h = mix(aA.z, aA.w, pr);
  h = mix(h, aA.w, uLevel);
  float wave = waves(p);
  float breath = sin(uTime * 0.7 + aC.x * 6.2831) * 0.03 * (1.0 - uLevel * 0.6);
  h = h * (1.0 + breath) + wave * (0.9 - uLevel * 0.45);
  float pd = distance(p, uPointer.xy);
  float hover = uPointer.z * exp(-pd * pd / 4.0);
  h += hover * 0.55;
  h = max(h * growth(p), 0.025);

  vec3 pos = position;
  pos.xz *= uColSize;
  pos.y *= h;
  pos.xz += p;
  vObj = pos;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float need = max(aA.w, 0.05);
  float ratio = h / need;
  vShort = smoothstep(0.74, 0.2, ratio) * (1.0 - uLevel);
  vExcess = smoothstep(1.5, 2.7, ratio) * (1.0 - uLevel);
  vWave = clamp(wave, 0.0, 1.2);
  vFocus = focusMask(p);
  vNormal = normal;
  vUv = uv;
  vY = position.y;
  vDepth = -mv.z;
  vHover = hover;
  vNew = step(0.5, mod(aC.y, 2.0)) * (1.0 - pr);
  vHeight = h;
}
`;

export const columnFragment = /* glsl */ `
${projection}
uniform vec3 uBone;
uniform vec3 uShadow;
uniform vec3 uSignalColor;
uniform vec3 uInk;
uniform vec3 uHaze;
uniform vec3 uMint;
uniform float uFogNear;
uniform float uFogFar;
uniform float uFocusAmt;
uniform float uLevel;
varying vec3 vNormal;
varying vec2 vUv;
varying float vY;
varying float vShort;
varying float vExcess;
varying float vWave;
varying float vFocus;
varying float vDepth;
varying float vHover;
varying float vNew;
varying float vHeight;
varying vec3 vObj;

void main() {
  vec3 n = normalize(vNormal);
  vec3 L = normalize(vec3(-0.55, 0.85, 0.4));
  float diffuse = 0.42 + 0.58 * max(dot(n, L), 0.0);
  float top = step(0.5, n.y);

  // Overstock reads as heavy, dim stock; healthy stock as bone.
  vec3 base = mix(uBone * 0.74, uShadow, vExcess * 0.72);
  float ao = mix(0.38, 1.0, smoothstep(0.0, 1.0, vY));
  vec3 col = base * diffuse * mix(ao, 1.22, top);

  // Crisp carton edges on every face.
  float ex = min(vUv.x, 1.0 - vUv.x);
  float ey = min(vUv.y, 1.0 - vUv.y);
  float edge = top > 0.5 ? min(ex, ey) : ex;
  col *= mix(0.62, 1.0, smoothstep(0.0, 0.07, edge));

  // Shortage: the pit glows signal orange from the floor up.
  col = mix(col, uSignalColor * mix(0.8, 1.3, top), vShort * 0.95);
  // New launch with no history: a mint outline waiting for its first forecast.
  col = mix(col, uMint * 0.8, vNew * (1.0 - smoothstep(0.0, 0.12, edge)) * 0.9);
  // A passing signal tints the stock it touches.
  col = mix(col, uSignalColor * 1.15, clamp(vWave, 0.0, 1.0) * 0.75);
  col += uBone * vHover * 0.18;

  // Focus: dim everything outside the problem being discussed.
  col *= mix(1.0, mix(0.22, 1.12, vFocus), uFocusAmt);
  col = mix(col, uBone * diffuse * mix(0.9, 1.04, top), uLevel * 0.25);

  // Projected light: full on the tops, a streak down the sides.
  col += projected(vObj.xz, mix(0.28, 1.0, top));

  // Distance fades into a faint haze, so the field has a horizon.
  float fog = smoothstep(uFogNear, uFogFar, vDepth);
  gl_FragColor = vec4(mix(col, uHaze, fog), 1.0);
}
`;

export const bandVertex = /* glsl */ `
${common}
attribute vec4 aA;
attribute vec4 aB;
attribute vec2 aC;
uniform float uColSize;
varying vec2 vUv;
varying vec3 vNormal;
varying float vAlpha;
varying float vDepth;

void main() {
  vec2 p = aA.xy;
  float pr = decideProgress(aB.z, aB.w);
  float lo = aB.x;
  float hi = aB.y;
  float g = growth(p);
  float y0 = lo * g;
  float y1 = max(hi * g, y0 + 0.02);
  vec3 pos = position;
  pos.xz *= uColSize * 1.24;
  pos.y = mix(y0, y1, pos.y) + waves(p) * 0.5;
  pos.xz += p;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float ratio = aA.z / max(aA.w, 0.05);
  float mismatch = clamp(abs(ratio - 1.0) * 1.3, 0.0, 1.0);
  float isNew = step(0.5, mod(aC.y, 2.0));
  float emphasis = max(mismatch, isNew);
  vAlpha = uForecast * (1.0 - pr * 0.92) * (1.0 - uLevel) * mix(0.28, 1.0, emphasis);
  vAlpha *= mix(1.0, mix(0.15, 1.0, focusMask(p)), uFocusAmt);
  vUv = uv;
  vNormal = normal;
  vDepth = -mv.z;
}
`;

export const bandFragment = /* glsl */ `
uniform vec3 uMint;
uniform float uFogNear;
uniform float uFogFar;
varying vec2 vUv;
varying vec3 vNormal;
varying float vAlpha;
varying float vDepth;

void main() {
  float ex = min(vUv.x, 1.0 - vUv.x);
  float ey = min(vUv.y, 1.0 - vUv.y);
  float edge = 1.0 - smoothstep(0.0, 0.06, min(ex, ey));
  float top = step(0.5, abs(vNormal.y));
  float a = vAlpha * (0.07 + edge * 0.62 + top * 0.08);
  float fog = smoothstep(uFogNear, uFogFar, vDepth);
  gl_FragColor = vec4(uMint, a * (1.0 - fog));
}
`;

export const travellerVertex = /* glsl */ `
${common}
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec2 aT; // kind, delay
varying float vKind;
varying vec3 vNormal;
varying float vDepth;

void main() {
  vec2 w = aT.x < 0.5 ? vec2(0.24, 0.56) : vec2(0.0, 0.3);
  float local = (uDecide - w.x) / (w.y - w.x);
  float p = clamp((local - aT.y * 0.6) / 0.4, 0.0, 1.0);
  float live = step(0.002, p) * step(p, 0.985) * (1.0 - uLevel);
  vec3 at;
  if (aT.x < 0.5) {
    float d = distance(aFrom.xz, aTo.xz);
    vec3 c = (aFrom + aTo) * 0.5 + vec3(0.0, 2.0 + d * 0.42, 0.0);
    float e = p * p * (3.0 - 2.0 * p);
    at = mix(mix(aFrom, c, e), mix(c, aTo, e), e);
  } else {
    at = mix(aFrom, aTo, p * p);
  }
  float s = 0.36 * live * (0.6 + 0.4 * sin(p * 3.1416));
  float a = p * 3.1416 + aT.y * 6.0;
  mat2 r = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec3 pos = position * s;
  pos.xz = r * pos.xz;
  vec4 mv = modelViewMatrix * vec4(pos + at, 1.0);
  gl_Position = projectionMatrix * mv;
  vKind = aT.x;
  vNormal = normal;
  vDepth = -mv.z;
}
`;

export const travellerFragment = /* glsl */ `
uniform vec3 uSignalColor;
uniform vec3 uBone;
uniform vec3 uInk;
uniform float uFogNear;
uniform float uFogFar;
varying float vKind;
varying vec3 vNormal;
varying float vDepth;
void main() {
  float light = 0.6 + 0.4 * max(dot(normalize(vNormal), normalize(vec3(-0.5, 0.9, 0.4))), 0.0);
  vec3 col = (vKind < 0.5 ? uSignalColor : uBone) * light;
  float fog = smoothstep(uFogNear, uFogFar, vDepth);
  gl_FragColor = vec4(mix(col, uInk, fog * 0.8), 1.0);
}
`;

export const arcVertex = /* glsl */ `
${common}
attribute float aT;
attribute float aDelay;
varying float vAlpha;
void main() {
  float local = (uDecide - 0.24) / (0.56 - 0.24);
  float p = clamp((local - aDelay * 0.6) / 0.4, 0.0, 1.0);
  float trail = smoothstep(p - 0.55, p, aT) * step(aT, p + 0.001);
  vAlpha = trail * (1.0 - smoothstep(0.88, 1.0, p)) * (1.0 - uLevel) * step(0.001, p);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const arcFragment = /* glsl */ `
uniform vec3 uSignalColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uSignalColor, vAlpha * 0.85);
}
`;

export const floorVertex = /* glsl */ `
varying vec2 vXZ;
varying float vDepth;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  // Object space: the grid and the projector stay with the field when AR/VR scales it.
  vXZ = position.xz;
  vec4 mv = viewMatrix * world;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const floorFragment = /* glsl */ `
${projection}
uniform vec3 uLine;
uniform vec3 uInk;
uniform vec2 uHalf;
uniform float uFogNear;
uniform float uFogFar;
uniform float uIntro;
varying vec2 vXZ;
varying float vDepth;
void main() {
  vec2 g = abs(fract(vXZ - 0.5) - 0.5);
  vec2 fw = fwidth(vXZ) * 1.1;
  float line = 1.0 - min(smoothstep(0.0, fw.x, g.x), smoothstep(0.0, fw.y, g.y));
  vec2 outside = max(abs(vXZ) - uHalf, 0.0);
  float fade = 1.0 - smoothstep(0.0, 9.0, length(outside));
  vec2 major = abs(fract((vXZ - 0.5) / 6.0) - 0.5) * 6.0;
  float majorLine = 1.0 - min(smoothstep(0.0, fw.x, major.x), smoothstep(0.0, fw.y, major.y));
  float a = (line * 0.38 + majorLine * 0.3) * fade * uIntro;
  // The projector's spill on the ground between the columns.
  vec3 spill = projected(vXZ, 0.5);
  float s = max(spill.r, max(spill.g, spill.b));
  float fog = smoothstep(uFogNear, uFogFar, vDepth);
  gl_FragColor = vec4(mix(uLine, spill / max(s, 0.001), s / max(a + s, 0.001)), max(a, s) * (1.0 - fog));
}
`;
