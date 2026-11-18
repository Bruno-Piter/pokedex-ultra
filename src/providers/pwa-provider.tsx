"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { useEffect, type ReactNode } from "react";
import { dataUrl } from "@/lib/data/version";

function isStandaloneDisplay(): boolean {
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return window.matchMedia("(display-mode: standalone)").matches || iosStandalone;
}

/** Adds `standalone` to <html> when running as an installed app. */
function useStandaloneClass() {
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const sync = () => {
      document.documentElement.classList.toggle("standalone", isStandaloneDisplay());
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
}

/**
 * On the very first visit the Pokédex data downloads before the service
 * worker takes control, so it never reaches the SW cache. Request it again
 * (served from the HTTP cache) once the worker controls the page.
 */
function useWarmDataCache() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || navigator.serviceWorker.controller) return;
    const warm = () => {
      for (const file of ["catalog.json", "moves.json"]) {
        fetch(dataUrl(file), { cache: "force-cache" }).catch(() => {});
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", warm, { once: true });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", warm);
  }, []);
}

export function PwaProvider({ children }: { children: ReactNode }) {
  useStandaloneClass();
  useWarmDataCache();

  // No `reloadOnOnline`: phones flap between networks constantly and the
  // reload wiped the user's place. Queries retry on reconnect instead.
  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
    >
      {children}
    </SerwistProvider>
  );
}
