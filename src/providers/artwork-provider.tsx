"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ArtworkMode = "official" | "pixel";

const STORAGE_KEY = "pokedex-artwork-mode";

type ArtworkContextValue = {
  mode: ArtworkMode;
  setMode: (mode: ArtworkMode) => void;
  toggle: () => void;
  mounted: boolean;
};

const ArtworkContext = createContext<ArtworkContextValue | null>(null);

function readStoredMode(): ArtworkMode {
  if (typeof window === "undefined") return "official";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "pixel" ? "pixel" : "official";
}

export function ArtworkProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ArtworkMode>("official");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setModeState(readStoredMode());
    setMounted(true);
  }, []);

  const setMode = useCallback((next: ArtworkMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setMode(mode === "official" ? "pixel" : "official");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, setMode, toggle, mounted }),
    [mode, setMode, toggle, mounted],
  );

  return (
    <ArtworkContext.Provider value={value}>{children}</ArtworkContext.Provider>
  );
}

export function useArtworkMode() {
  const context = useContext(ArtworkContext);
  if (!context) {
    throw new Error("useArtworkMode must be used within ArtworkProvider");
  }
  return context;
}
