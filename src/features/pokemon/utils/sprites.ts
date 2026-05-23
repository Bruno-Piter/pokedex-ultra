import type { Pokemon, PokemonSprites } from "@/features/pokemon/types";

const SPRITE_CDN =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export type SpriteVariant = "artwork" | "pixel";

function pickPixelFromSprites(sprites: PokemonSprites): string | null {
  const candidates = [
    sprites.versions?.["generation-ix"]?.["scarlet-violet"]?.front_default,
    sprites.versions?.["generation-viii"]?.icons?.front_default,
    sprites.versions?.["generation-vii"]?.icons?.front_default,
    sprites.versions?.["generation-vi"]?.["x-y"]?.front_default,
    sprites.versions?.["generation-v"]?.["black-white"]?.front_default,
    sprites.versions?.["generation-iv"]?.["heartgold-soulsilver"]?.front_default,
    sprites.versions?.["generation-iii"]?.emerald?.front_default,
    sprites.front_default,
  ];

  return candidates.find(Boolean) ?? null;
}

export function getOfficialArtwork(pokemon: Pokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default
  );
}

export function getPixelArtwork(pokemon: Pokemon): string | null {
  return (
    pickPixelFromSprites(pokemon.sprites) ?? getSpriteUrl(pokemon.id, "pixel")
  );
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
