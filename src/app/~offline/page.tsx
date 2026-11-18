import type { Metadata } from "next";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      <svg viewBox="0 0 100 100" aria-hidden className="size-20 text-muted-foreground/40">
        <path d="M6 50a44 44 0 0 1 88 0Z" className="fill-brand/30" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" />
        <path d="M6 50h88" stroke="currentColor" strokeWidth="7" />
        <circle cx="50" cy="50" r="13" className="fill-background" stroke="currentColor" strokeWidth="7" />
      </svg>
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-bold">You&apos;re offline</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page hasn&apos;t been saved for offline use yet. Pokémon you&apos;ve already
          opened stay available — reconnect to load the rest.
        </p>
      </div>
      <RetryButton />
    </main>
  );
}
