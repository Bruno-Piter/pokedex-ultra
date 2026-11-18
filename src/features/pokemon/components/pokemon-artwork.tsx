"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getSpriteAttempts, type SpriteStyle } from "@/features/pokemon/utils/sprites";
import { useArtworkMode } from "@/providers/artwork-provider";
import { cn } from "@/lib/utils";

type PokemonArtworkProps = {
  id: number;
  alt: string;
  /** Sprite availability flags from the catalog (skips missing images). */
  flags?: number;
  shiny?: boolean;
  /** Overrides the global official/pixel setting. */
  style?: SpriteStyle;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Pokémon sprite that fills its (relatively positioned) parent. Tries each
 * image in turn and ends in a Poké Ball placeholder, fading in once loaded.
 */
export function PokemonArtwork({
  id,
  alt,
  flags,
  shiny = false,
  style,
  sizes,
  priority,
  className,
}: PokemonArtworkProps) {
  const { mode } = useArtworkMode();
  const spriteStyle: SpriteStyle = style ?? (mode === "pixel" ? "pixel" : "artwork");
  const attempts = useMemo(
    () => getSpriteAttempts(id, spriteStyle, { shiny, flags }),
    [id, spriteStyle, shiny, flags],
  );

  const sourceKey = `${id}:${spriteStyle}:${shiny}`;
  const [state, setState] = useState({ key: sourceKey, attempt: 0, loaded: false });
  // Reset when the Pokémon or sprite style changes (derived state, no effect).
  if (state.key !== sourceKey) {
    setState({ key: sourceKey, attempt: 0, loaded: false });
  }

  const current = attempts[state.attempt];
  if (!current) {
    return <PokeballPlaceholder className={className} />;
  }

  return (
    <Image
      key={`${current.src}:${current.unoptimized}`}
      src={current.src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={current.unoptimized}
      draggable={false}
      data-loaded={state.loaded}
      onLoad={() => setState((prev) => ({ ...prev, loaded: true }))}
      onError={() =>
        setState((prev) => ({ ...prev, attempt: prev.attempt + 1, loaded: false }))
      }
      className={cn(
        "object-contain opacity-0 transition-opacity duration-300 select-none data-[loaded=true]:opacity-100",
        current.pixel && "image-rendering-pixelated",
        className,
      )}
    />
  );
}

export function PokeballPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("absolute inset-0 m-auto size-1/2 text-muted-foreground/25", className)}
    >
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" />
      <path d="M6 50h88" stroke="currentColor" strokeWidth="8" />
      <circle cx="50" cy="50" r="13" fill="var(--background)" stroke="currentColor" strokeWidth="8" />
    </svg>
  );
}
