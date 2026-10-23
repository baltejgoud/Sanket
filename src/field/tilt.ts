/**
 * Tilt to look: the phone's orientation drives the field's window parallax, as the pointer does
 * on a desktop. iOS asks permission, so this must start from a tap; the first reading is the
 * neutral pose. Returns a stop function.
 */
export const tiltSupported = () =>
  typeof window !== "undefined" && "DeviceOrientationEvent" in window && matchMedia("(pointer: coarse)").matches;

export async function startTilt(onTilt: (x: number, y: number) => void) {
  const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
  if (D.requestPermission && (await D.requestPermission()) !== "granted") return null;
  const clamp = (n: number) => Math.max(-1, Math.min(1, n));
  let base: number | null = null;
  const on = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    base ??= e.beta;
    onTilt(clamp(e.gamma / 25), clamp((base - e.beta) / 25));
  };
  window.addEventListener("deviceorientation", on);
  return () => {
    window.removeEventListener("deviceorientation", on);
    onTilt(0, 0);
  };
}
