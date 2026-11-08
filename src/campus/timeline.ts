/** One reversible narrative. All values are derived from document position, never trigger history. */
export const CHAPTER_IDS = ['signal', 'warehouse', 'problems', 'forecast', 'decide', 'contact'] as const;
export type Facility = 'warehouse' | 'office' | 'factory' | 'dispatch';
export type Vec3 = [number, number, number];
export const clamp = (v: number) => Math.max(0, Math.min(1, v));
export const smooth = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t); };
export const ramp = (v: number, a: number, b: number) => smooth((v - a) / (b - a));
/** Finish each action while its reading panel is still sticky; reserve the exit for transition. */
export function documentProgress(y: number, positions: number[], viewportHeight: number) {
  let i = 0;
  // Native anchor scrolling can round fractional CSS pixels down.
  while (i < positions.length - 1 && y + .5 >= positions[i + 1]) i++;
  const length = (positions[i + 1] ?? positions[i] + viewportHeight * 1.05) - positions[i];
  const hold = Math.max(viewportHeight * .2, length - viewportHeight);
  const offset = Math.max(0, y - positions[i]);
  const phase = offset <= hold ? .86 * offset / hold : .86 + .14 * clamp((offset - hold) / Math.max(1, length - hold));
  return Math.min(5, i + phase);
}
// Each shot moves early, then holds so its card can be read at normal scroll speed.
const shots: { at: number; position: Vec3; target: Vec3; scale: number; roof: number; wall: number }[] = [
  { at: 0, position: [38, 31, 43], target: [0, 0, 0], scale: 60, roof: 0, wall: 0 },
  { at: 1, position: [36, 30, 39], target: [1, 1, 0], scale: 46, roof: 0, wall: 0 },
  { at: 1.35, position: [36, 30, 39], target: [1, 1, 0], scale: 46, roof: 0, wall: 0 },
  { at: 1.56, position: [23, 26, 25], target: [5, 2, -1], scale: 29, roof: 15, wall: 1 },
  { at: 1.86, position: [23, 26, 25], target: [5, 2, -1], scale: 29, roof: 15, wall: 1 },
  { at: 2.08, position: [12, 12, 23], target: [2.4, 2.2, -1.5], scale: 21, roof: 15, wall: 1 },
  { at: 2.28, position: [12, 12, 23], target: [2.4, 2.2, -1.5], scale: 21, roof: 15, wall: 1 },
  { at: 2.38, position: [8.5, 8.8, 20], target: [2.4, 2.5, -1.5], scale: 17, roof: 15, wall: 1 },
  { at: 2.57, position: [8.5, 8.8, 20], target: [2.4, 2.5, -1.5], scale: 17, roof: 15, wall: 1 },
  { at: 2.68, position: [25, 12, 18], target: [10.8, 2.5, -1.5], scale: 18, roof: 15, wall: 1 },
  { at: 2.86, position: [25, 12, 18], target: [10.8, 2.5, -1.5], scale: 18, roof: 15, wall: 1 },
  // Five product beats: connect, forecast, replenish, transfer, markdown.
  { at: 3.04, position: [14, 29, 33], target: [1, 2, -.5], scale: 33, roof: 15, wall: 1 },
  { at: 3.15, position: [14, 29, 33], target: [1, 2, -.5], scale: 33, roof: 15, wall: 1 },
  { at: 3.21, position: [12, 20, 23], target: [2.4, 2.5, -1.5], scale: 20, roof: 15, wall: 1 },
  { at: 3.32, position: [12, 20, 23], target: [2.4, 2.5, -1.5], scale: 20, roof: 15, wall: 1 },
  { at: 3.39, position: [8.5, 10, 22], target: [2.4, 2.5, -1.5], scale: 18, roof: 15, wall: 1 },
  { at: 3.49, position: [8.5, 10, 22], target: [2.4, 2.5, -1.5], scale: 18, roof: 15, wall: 1 },
  { at: 3.56, position: [22, 15, 24], target: [6.6, 2.5, -2], scale: 19, roof: 15, wall: 1 },
  { at: 3.66, position: [22, 15, 24], target: [6.6, 2.5, -2], scale: 19, roof: 15, wall: 1 },
  { at: 3.73, position: [26, 12, 19], target: [10.8, 2.5, -2], scale: 19, roof: 15, wall: 1 },
  { at: 3.86, position: [26, 12, 19], target: [10.8, 2.5, -2], scale: 19, roof: 15, wall: 1 },
  { at: 4.04, position: [21, 15, 23], target: [6.6, 2.5, -2], scale: 19, roof: 15, wall: 1 },
  { at: 4.17, position: [21, 15, 23], target: [6.6, 2.5, -2], scale: 19, roof: 15, wall: 1 },
  // The pick and the loading happen inside settled shots: each camera arrives before its forklift moves.
  // Pick: down the A2/A3 aisle from the front, so the racks never hide the forklift.
  { at: 4.215, position: [4.2, 12.5, 19.5], target: [3.2, 1.6, .5], scale: 18, roof: 15, wall: 1 },
  { at: 4.344, position: [4.2, 12.5, 19.5], target: [3.2, 1.6, .5], scale: 18, roof: 15, wall: 1 },
  // Load: high over the front-left, looking past the trailer roof into dock 02 as the pallet goes in.
  { at: 4.40, position: [-7, 19, 17], target: [1.4, 1.2, 5.6], scale: 17, roof: 15, wall: 1 },
  { at: 4.516, position: [-7, 19, 17], target: [1.4, 1.2, 5.6], scale: 17, roof: 15, wall: 1 },
  { at: 4.60, position: [-12, 24, 42], target: [6, 0, 10], scale: 34, roof: 15, wall: 1 },
  { at: 4.688, position: [-12, 24, 42], target: [6, 0, 10], scale: 34, roof: 15, wall: 1 },
  { at: 4.78, position: [38, 30, 41], target: [7, 1, 5], scale: 44, roof: 15, wall: 1 },
  { at: 4.86, position: [38, 30, 41], target: [7, 1, 5], scale: 44, roof: 15, wall: 1 },
  { at: 5, position: [39, 31, 43], target: [0, 0, 0], scale: 60, roof: 0, wall: 0 },
];
export const BEAT_COUNTS: Record<string, number> = { warehouse: 2, problems: 3, forecast: 5, decide: 5 };
export function storyBeat(progress: number, chapterIndex: number, count: number) {
  return Math.min(count - 1, Math.floor(clamp((progress - chapterIndex) / .86) * count));
}
export function sampleTimeline(progress: number, reduced = false) {
  const p = Math.max(0, Math.min(5, progress));
  const chapter = Math.floor(p), count = BEAT_COUNTS[CHAPTER_IDS[chapter]];
  const cameraP = reduced ? (count ? chapter + .86 * (storyBeat(p, chapter, count) + .5) / count : chapter) : p;
  const end = Math.max(1, shots.findIndex(s => s.at >= cameraP));
  const a = shots[end - 1], b = shots[end];
  const k = smooth((cameraP - a.at) / (b.at - a.at));
  const mix = (x: number, y: number) => x + (y - x) * k;
  const vector = (x: Vec3, y: Vec3) => x.map((v, i) => mix(v, y[i])) as Vec3;
  const decision = clamp((p - 4) / .86);
  return {
    progress: p, chapter: Math.min(5, Math.floor(p)),
    position: vector(a.position, b.position), target: vector(a.target, b.target),
    scale: mix(a.scale, b.scale), roof: mix(a.roof, b.roof), wall: mix(a.wall, b.wall),
    // The opening frames the warehouse low under the headline; the closing returns to that wide shot.
    // It rises only as the opening copy fades, so the words never sit over the lit roof.
    hero: 1 - ramp(p, .84, .95), finale: ramp(p, 4.86, 5),
    shortage: ramp(p, 2.31, 2.43),
    resolution: ramp(p, 3.18, 3.28), problemStep: storyBeat(p, 2, 3),
    solutionStep: storyBeat(p, 3, 5),
    replenishment: ramp(p, 3.36, 3.45),
    highlight: ramp(p, 2, 2.3) * (1 - ramp(p, 4.8, 5)),
    signal: ramp(p, 3.03, 3.22), decision,
    pallet: ramp(decision, .25, .38), loading: ramp(decision, .45, .56),
    route: ramp(decision, .62, .72), truck: ramp(decision, .82, .94),
    step: storyBeat(p, 4, 5),
    // Only the wide shots carry ambient life; every reading hold stays still.
    ambient: Math.max(1 - ramp(p, .84, .95), ramp(p, 4.86, 5)),
    label: p < 1 ? 'none' : p < 2 ? 'warehouse' : p < 3 ? 'problem' : p < 4 ? 'forecast' : p < 4.95 ? 'decision' : 'none',
  };
}
export type TimelineState = ReturnType<typeof sampleTimeline>;
/**
 * The opening shot's lens (a multiple of the shot scale) and the screen height its subject sits at, for
 * a viewport and the bottom of the hero copy. Desktop frames the model in the room under the copy,
 * letting it tuck 50px behind the hint; 1440×900 is the designed shot (×.9, centre at 84%), and shorter
 * screens zoom out instead of cutting the warehouse off at the fold. The engine and the loading poster
 * (CampusStage.tsx) share it, so the poster lands exactly where the first frame will draw.
 */
export function heroFrame(width: number, height: number, copyBottom: number | null) {
  if (width < 760) return { lens: 1.5, center: height * .8 };
  const roomTop = (copyBottom ?? height * .65) - 50, room = Math.max(120, height - roomTop);
  return { lens: Math.min(1.5, Math.max(.9, .9 * height / (2.466 * room))), center: Math.min(height * .9, Math.max(height * .74, roomTop + room * .6055)) };
}
export const facilityAnchors: Record<Facility, Vec3> = {
  warehouse: [6, 7, 1], office: [-7, 5.8, 5], factory: [-10, 6, -9], dispatch: [12.7, 4, 11],
};
