"use client";

import { RefreshCw } from "lucide-react";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95"
    >
      <RefreshCw className="size-4" />
      Try again
    </button>
  );
}
