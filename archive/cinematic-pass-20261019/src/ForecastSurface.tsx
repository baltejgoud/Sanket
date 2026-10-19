import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/** A probability fan: shared history resolves into several possible future paths. */
export default function ForecastSurface({ phase, paused, onReady }: { phase: number; paused: boolean; onReady: (ready: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef({ phase, paused });
  controls.current = { phase, paused };
  const ready = useRef(onReady);
  ready.current = onReady;
  const invalidate = useRef<() => void>(() => {});
  useEffect(() => { invalidate.current(); }, [phase, paused]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x111311, 0);
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
    camera.position.set(0, 5.1, 16.8); camera.lookAt(0, .1, 0);
    const group = new THREE.Group();
    group.position.set(1.9, -1.4, 0); group.rotation.z = .13;
    scene.add(group);
    const lines: { positions: Float32Array; geometry: THREE.BufferGeometry; material: THREE.LineBasicMaterial }[] = [];
    const count = 100, steps = 160;
    for (let i = 0; i < count; i++) {
      const positions = new Float32Array(steps * 3);
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.LineBasicMaterial({ color: i % 9 < 3 ? 0xff785e : (i % 5 === 0 ? 0xc29b72 : 0xe5dccc), transparent: true, opacity: i % 7 === 0 ? .85 : .48 });
      // All procedural vertices remain inside this local bound in every phase.
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
      group.add(new THREE.Line(geometry, material)); lines.push({ positions, geometry, material });
    }
    const grid = new THREE.GridHelper(38, 36, 0x494238, 0x252924);
    (Array.isArray(grid.material) ? grid.material : [grid.material]).forEach(material => { material.transparent = true; material.opacity = .28; });
    grid.position.set(2, -2, -2); scene.add(grid);
    const points = new THREE.BufferGeometry();
    const pointArray = new Float32Array(count * 3); points.setAttribute('position', new THREE.BufferAttribute(pointArray, 3));
    points.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    const pointMaterial = new THREE.PointsMaterial({ color: 0xff997a, size: .045, transparent: true, opacity: .9, sizeAttenuation: true });
    group.add(new THREE.Points(points, pointMaterial));
    const target = { x: 0, y: 0 }, cursor = { x: 0, y: 0 };
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); target.x = (e.clientX - r.left) / r.width - .5; target.y = (e.clientY - r.top) / r.height - .5; invalidate.current(); };
    const reset = () => { target.x = 0; target.y = 0; invalidate.current(); };
    const parent = el.closest('section')!;
    parent.addEventListener('pointermove', move); parent.addEventListener('pointerleave', reset);
    let inView = true, frame = 0, last = 0, time = 0, currentPhase = 1, disposed = false, scrollProgress = 0;
    const onScroll = () => { scrollProgress = Math.max(0, Math.min(1, -parent.getBoundingClientRect().top / parent.offsetHeight)); invalidate.current(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    const resize = () => { const { width, height } = el.getBoundingClientRect(); renderer.setSize(width, height); camera.aspect = width / Math.max(height, 1); camera.updateProjectionMatrix(); invalidate.current(); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(el); resize();
    const render = (now: number) => {
      frame = 0;
      if (disposed || !inView || document.hidden) return;
      if (now - last < 32) { frame = requestAnimationFrame(render); return; }
      const delta = Math.min((now - last) / 1000, .05); last = now;
      if (!controls.current.paused) time += delta;
      currentPhase += (controls.current.phase - currentPhase) * .045;
      cursor.x += (target.x - cursor.x) * .035; cursor.y += (target.y - cursor.y) * .035;
      group.rotation.y = cursor.x * .16; group.rotation.x = cursor.y * .08;
      group.rotation.z = .13 + scrollProgress * .12;
      group.position.y = -1.4 + scrollProgress * .7;
      const scattered = Math.max(0, 1 - currentPhase), decided = Math.max(0, currentPhase - 1);
      for (let i = 0; i < count; i++) {
        const lane = (i / (count - 1) - .5) * 2;
        const { positions, geometry } = lines[i];
        for (let j = 0; j < steps; j++) {
          const u = j / (steps - 1), x = (u - .5) * 15;
          const envelope = Math.sin(u * Math.PI) ** 2;
          const crest = Math.exp(-(((u - .63) / .17) ** 2)) * 2.7;
          const fan = Math.max(0, (u - .38) / .62);
          const ripples = Math.sin(u * 14 + lane * 2.4 + time * .35) * .16 * envelope;
          const signalNoise = Math.sin(u * 29 + i * .5) * .48 * scattered * envelope;
          const convergence = 1 - decided * fan * .65;
          const y = crest + ripples + lane * fan * (4.5 + Math.sin(u * 5) * .4) * convergence + signalNoise;
          positions[j * 3] = x;
          positions[j * 3 + 1] = y;
          positions[j * 3 + 2] = lane * (2.1 * fan + .03) * convergence;
          if (j === steps - 1) { pointArray[i * 3] = x; pointArray[i * 3 + 1] = y; pointArray[i * 3 + 2] = positions[j * 3 + 2]; }
        }
        geometry.attributes.position.needsUpdate = true;
      }
      points.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      const settling = Math.abs(controls.current.phase - currentPhase) > .001 || Math.abs(target.x - cursor.x) > .001 || Math.abs(target.y - cursor.y) > .001;
      if (!controls.current.paused || settling) frame = requestAnimationFrame(render);
    };
    const wake = () => { if (!disposed && inView && !document.hidden && !frame) frame = requestAnimationFrame(render); };
    invalidate.current = wake;
    const suspend = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const visibility = () => { if (document.hidden) suspend(); else wake(); };
    document.addEventListener('visibilitychange', visibility);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) wake(); else suspend(); }, { rootMargin: '80px' }); observer.observe(el);
    const contextLost = (event: Event) => { event.preventDefault(); disposed = true; cancelAnimationFrame(frame); el.style.opacity = '0'; ready.current(false); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    wake(); ready.current(true);
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect();
      invalidate.current = () => {};
      document.removeEventListener('visibilitychange', visibility);
      parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', reset);
      window.removeEventListener('scroll', onScroll);
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      lines.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
      grid.geometry.dispose(); (Array.isArray(grid.material) ? grid.material : [grid.material]).forEach(m => m.dispose());
      points.dispose(); pointMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} className="forecast-surface" aria-hidden="true"/>;
}
