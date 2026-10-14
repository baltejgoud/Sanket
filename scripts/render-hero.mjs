// Re-render the hero motion graphic (hero-loop/) and publish the web copies to public/assets.
// Needs Node 22+ and FFmpeg on PATH.
import { spawnSync } from "node:child_process";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "hero-loop");
function run(cmd, args, cwd = dir) {
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32" && cmd === "npx",
  });
  if (r.status !== 0) throw Error(`${cmd} failed (${r.status})`);
}
run("npx", ["--yes", "hyperframes@0.8.156", "check"]);
run("npx", [
  "--yes",
  "hyperframes@0.8.156",
  "render",
  "--fps",
  "30",
  "--quality",
  "delivery",
  "--output",
  "hero-loop.mp4",
]);
run(
  "ffmpeg",
  [
    "-y",
    "-i",
    "hero-loop/hero-loop.mp4",
    "-vf",
    "scale=720:720:flags=lanczos",
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "24",
    "-preset",
    "slow",
    "-movflags",
    "+faststart",
    "-an",
    "public/assets/hero-loop.mp4",
  ],
  root,
);
run(
  "ffmpeg",
  [
    "-y",
    "-ss",
    "8.5",
    "-i",
    "hero-loop/hero-loop.mp4",
    "-frames:v",
    "1",
    "-vf",
    "scale=720:720",
    "-q:v",
    "3",
    "public/assets/hero-loop-poster.jpg",
  ],
  root,
);
console.log("Hero loop published to public/assets.");
