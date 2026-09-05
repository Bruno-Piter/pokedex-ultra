"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { useEffect, type ReactNode } from "react";

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)");
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq.matches || iosStandalone;
}

function useStandaloneClass() {
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const sync = () => {
      const standalone = isStandaloneDisplay();
      document.documentElement.classList.toggle("standalone", standalone);
      document.body.classList.toggle("standalone", standalone);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
}

export function PwaProvider({ children }: { children: ReactNode }) {
  useStandaloneClass();

  return (
    <SerwistProvider
      swUrl="/serwist/sw.js"
      disable={process.env.NODE_ENV === "development"}
      reloadOnOnline
    >
      {children}
    </SerwistProvider>
  );
}
