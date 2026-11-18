import { useCallback, useSyncExternalStore } from "react";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the window has scrolled past `threshold` px. */
export function useScrolledPast(threshold: number): boolean {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribeToScroll, getSnapshot, () => false);
}
