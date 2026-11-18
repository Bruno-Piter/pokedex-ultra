"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ArtworkMode = "official" | "pixel";

const STORAGE_KEY = "pokedex-artwork-mode";
const listeners = new Set<() => void>();

function readMode(): ArtworkMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === "pixel" ? "pixel" : "official";
  } catch {
    return "official";
  }
}

function writeMode(mode: ArtworkMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Private mode / storage disabled: keep the in-memory change only.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerMode = (): ArtworkMode => "official";

/**
 * Global sprite style (official artwork or pixel art), stored in
 * localStorage. useSyncExternalStore renders the server value during
 * hydration, so there's no hydration mismatch.
 */
export function useArtworkMode() {
  const mode = useSyncExternalStore(subscribe, readMode, getServerMode);
  const setMode = useCallback((next: ArtworkMode) => writeMode(next), []);
  const toggle = useCallback(
    () => writeMode(readMode() === "pixel" ? "official" : "pixel"),
    [],
  );
  return { mode, setMode, toggle };
}
