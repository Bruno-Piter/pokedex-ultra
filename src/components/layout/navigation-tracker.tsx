"use client";

import { useTrackInAppNavigation } from "@/hooks/use-back-navigation";

export function NavigationTracker() {
  useTrackInAppNavigation();
  return null;
}
