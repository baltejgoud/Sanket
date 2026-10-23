import type { StockField } from "../field/StockField";

/**
 * What this device can do to put the field in the room:
 * - ar: WebXR immersive-ar (Android Chrome with ARCore): place it on a real surface.
 * - vr: WebXR immersive-vr (Quest, Vision Pro): view it at table height.
 * - quickLook: Apple's AR viewer (iPhone, iPad), for the pre-rendered USDZ model.
 */
export async function xrSupport() {
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  const check = async (mode: XRSessionMode) => {
    try {
      return !!(await xr?.isSessionSupported(mode));
    } catch {
      return false;
    }
  };
  const [ar, vr] = await Promise.all([check("immersive-ar"), check("immersive-vr")]);
  const quickLook = !ar && document.createElement("a").relList.supports("ar");
  return { ar, vr: vr && !ar, quickLook };
}

/** Start an immersive session and hand it to the field. AR uses `overlay` for its controls. */
export async function startXR(field: StockField, mode: "ar" | "vr", overlay: HTMLElement | null) {
  const xr = (navigator as Navigator & { xr?: XRSystem }).xr;
  if (!xr) return null;
  const init: XRSessionInit =
    mode === "ar"
      ? { requiredFeatures: ["hit-test"], optionalFeatures: ["dom-overlay", "local"], ...(overlay ? { domOverlay: { root: overlay } } : {}) }
      : { optionalFeatures: ["local-floor"] };
  const session = await xr.requestSession(mode === "ar" ? "immersive-ar" : "immersive-vr", init);
  await field.xrBegin(mode, session);
  return session;
}
