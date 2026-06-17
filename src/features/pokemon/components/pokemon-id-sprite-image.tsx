"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import {
  getSpriteFallbackUrl,
  getSpriteUrl,
  type SpriteVariant,
} from "@/features/pokemon/utils/sprites";
import { useArtworkMode } from "@/providers/artwork-provider";
import { cn } from "@/lib/utils";

type PokemonIdSpriteImageProps = Omit<ImageProps, "src" | "alt"> & {
  pokemonId: number;
  alt: string;
};

export function PokemonIdSpriteImage({
  pokemonId,
  alt,
  className,
  ...props
}: PokemonIdSpriteImageProps) {
  const { mode } = useArtworkMode();
  const variant: SpriteVariant = mode === "pixel" ? "pixel" : "artwork";
  const preferred = getSpriteUrl(pokemonId, variant);
  const fallback = getSpriteFallbackUrl(pokemonId, variant);
  const [failedPreferred, setFailedPreferred] = useState<string | null>(null);
  const [lastPreferred, setLastPreferred] = useState(preferred);

  if (preferred !== lastPreferred) {
    setLastPreferred(preferred);
    setFailedPreferred(null);
  }

  const src = failedPreferred === preferred ? fallback : preferred;

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
        if (src !== fallback) {
          setFailedPreferred(preferred);
        }
      }}
    />
  );
}
