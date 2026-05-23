import type { Pokemon } from "@/features/pokemon/types";

const SPRITE_CDN =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export type SpriteVariant = "artwork" | "pixel";

export function getOfficialArtwork(pokemon: Pokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default
  );
}

export function getPixelArtwork(pokemon: Pokemon): string {
  return getSpriteUrl(pokemon.id, "pixel");
}

export function getPokemonSprite(
  pokemon: Pokemon,
  variant: SpriteVariant,
): string | null {
  return variant === "pixel"
    ? getPixelArtwork(pokemon)
    : getOfficialArtwork(pokemon);
}

export function getSpriteUrl(
  idOrName: string | number,
  variant: SpriteVariant = "artwork",
): string {
  if (variant === "artwork") {
    return `${SPRITE_CDN}/other/official-artwork/${idOrName}.png`;
  }
  return `${SPRITE_CDN}/${idOrName}.png`;
}

export function getSpriteFallbackUrl(
  idOrName: string | number,
  variant: SpriteVariant,
): string {
  return variant === "pixel"
    ? getSpriteUrl(idOrName, "artwork")
    : getSpriteUrl(idOrName, "pixel");
}
