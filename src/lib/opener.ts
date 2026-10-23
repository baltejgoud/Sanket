/** A tiny event bus for "open that dialog" from anywhere, without loading the dialog's chunk first. */
export function createOpener() {
  const openers = new Set<() => void>();
  return {
    open: () => openers.forEach(fn => fn()),
    onOpen(fn: () => void) {
      openers.add(fn);
      return () => void openers.delete(fn);
    },
  };
}
