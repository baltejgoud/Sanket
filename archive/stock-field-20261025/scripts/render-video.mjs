import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "brag-output/composition");
function run(cmd, args, cwd = dir) {
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32" && cmd === "npx",
  });
  if (r.status !== 0) throw Error(`${cmd} failed (${r.status})`);
}
run("npx", ["hyperframes@0.8.156", "check"]);
run("npx", [
  "hyperframes@0.8.156",
  "render",
  "--fps",
  "30",
  "--quality",
  "delivery",
  "--output",
  "../brag.mp4",
]);
run(
  "ffmpeg",
  [
    "-y",
    "-ss",
    "21.8",
    "-i",
    "brag.mp4",
    "-frames:v",
    "1",
    "-q:v",
    "2",
    "brag.jpg",
  ],
  path.join(root, "brag-output"),
);
run(
  "ffmpeg",
  [
    "-y",
    "-i",
    "brag.mp4",
    "-i",
    "brag.jpg",
    "-filter_complex",
    "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]",
    "-map",
    "[v]",
    "-map",
    "0:a?",
    "-c:v",
    "libx264",
    "-crf",
    "18",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "copy",
    "-movflags",
    "+faststart",
    "brag.poster.mp4",
  ],
  path.join(root, "brag-output"),
);
fs.renameSync(
  path.join(root, "brag-output/brag.poster.mp4"),
  path.join(root, "brag-output/brag.mp4"),
);
fs.copyFileSync(
  path.join(root, "brag-output/brag.mp4"),
  path.join(root, "public/assets/sanket-teaser.mp4"),
);
fs.copyFileSync(
  path.join(root, "brag-output/brag.jpg"),
  path.join(root, "public/assets/teaser-poster.jpg"),
);
run(
  "ffprobe",
  [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=width,height,r_frame_rate,nb_frames",
    "-of",
    "json",
    "brag.mp4",
  ],
  path.join(root, "brag-output"),
);
