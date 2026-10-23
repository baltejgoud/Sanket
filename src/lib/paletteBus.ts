/** Opens the ⌘K palette from anywhere (header, dock, hero) without loading its chunk first. */
const openers = new Set<() => void>();

export const palette = {
  open: () => openers.forEach(fn => fn()),
  onOpen(fn: () => void) {
    openers.add(fn);
    return () => void openers.delete(fn);
  },
};
