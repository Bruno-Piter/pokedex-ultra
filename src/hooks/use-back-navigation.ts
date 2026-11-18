"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

let hasInAppHistory = false;

type NavigationApi = {
  canGoBack?: boolean;
  currentEntry?: { index: number } | null;
  entries?: () => { url: string | null }[];
};

/** True when the previous history entry is a page of this app. */
function canGoBackInApp(): boolean {
  const navigation = (window as Window & { navigation?: NavigationApi }).navigation;
  if (navigation && typeof navigation.canGoBack === "boolean") {
    if (!navigation.canGoBack || !navigation.currentEntry || !navigation.entries) return false;
    const previous = navigation.entries()[navigation.currentEntry.index - 1];
    if (!previous?.url) return false;
    return new URL(previous.url).origin === window.location.origin;
  }
  return hasInAppHistory;
}

/** Records client-side navigations (fallback for browsers without the Navigation API). */
export function useTrackInAppNavigation() {
  const pathname = usePathname();
  const first = useRef(pathname);
  useEffect(() => {
    if (pathname !== first.current) hasInAppHistory = true;
  }, [pathname]);
}

/**
 * "Back" that returns to the previous screen of the app (keeping the list's
 * filters and scroll), or goes home when the page was opened directly.
 */
export function useBackNavigation(fallbackHref = "/") {
  const router = useRouter();
  return useCallback(() => {
    if (canGoBackInApp()) router.back();
    else router.push(fallbackHref, { scroll: false, transitionTypes: ["nav-back"] });
  }, [router, fallbackHref]);
}
