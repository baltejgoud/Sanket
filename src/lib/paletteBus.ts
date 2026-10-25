import { createOpener } from "./opener";

/** Opens the ⌘K palette from anywhere (header, shortcut). */
export const palette = createOpener();

/** Fetches the palette's chunk ahead of need: on idle after load, or when its button is pointed at or focused. */
export const preloadPalette = () => import("../components/Palette");

/**
 * Keys typed between asking for the palette and its chunk mounting would otherwise land on the
 * page. They are held here, and the palette opens with them already in its search field.
 */
let typed = "";
const hold = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
  if (e.key.length === 1) typed += e.key;
  else if (e.key === "Backspace") typed = typed.slice(0, -1);
  else return;
  e.preventDefault();
  e.stopPropagation();
};
export const paletteInput = {
  start() {
    typed = "";
    window.addEventListener("keydown", hold, true);
  },
  /** Stops holding keys and returns them (repeatable until the next start, for StrictMode's double render). */
  take() {
    window.removeEventListener("keydown", hold, true);
    return typed;
  },
};
