"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import type { Pokemon } from "@/features/pokemon/types";
import {
  getOfficialArtwork,
  getPokemonSprite,
  type SpriteVariant,
} from "@/features/pokemon/utils/sprites";
import { useArtworkMode } from "@/providers/artwork-provider";
import { cn } from "@/lib/utils";

type PokemonSpriteImageProps = Omit<ImageProps, "src" | "alt"> & {
  pokemon: Pokemon;
  alt: string;
};

export function PokemonSpriteImage({
  pokemon,
  alt,
  className,
  ...props
}: PokemonSpriteImageProps) {
  const { mode } = useArtworkMode();
  const variant: SpriteVariant = mode === "pixel" ? "pixel" : "artwork";
  const preferred = getPokemonSprite(pokemon, variant);
  const fallback = getOfficialArtwork(pokemon);
  const [src, setSrc] = useState(preferred ?? fallback);

  useEffect(() => {
    setSrc(preferred ?? fallback);
  }, [preferred, fallback]);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          className,
        )}
      >
        ?
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={cn(
        className,
        variant === "pixel" && "image-rendering-pixelated",
      )}
      onError={() => {
        if (fallback && src !== fallback) {
          setSrc(fallback);
        }
      }}
    />
  );
}
