import type { Pokemon } from "@/features/pokemon/types";

export function getOfficialArtwork(pokemon: Pokemon): string | null {
  return (
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default
  );
}

export function getSpriteUrl(
  idOrName: string | number,
  variant: "artwork" | "default" = "artwork",
): string {
  if (variant === "artwork") {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idOrName}.png`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${idOrName}.png`;
}
