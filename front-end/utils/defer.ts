export function defer(fn: () => void) {
  queueMicrotask(fn);
}
