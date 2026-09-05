import type { Pokemon } from "@/features/pokemon/types";
import type {
  SlimCatalogPayload,
  SlimCatalogPokemon,
} from "@/lib/catalog/types";

export function isSlimCatalogPayload(
  value: unknown,
): value is SlimCatalogPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    "pokemon" in value &&
    Array.isArray((value as SlimCatalogPayload).pokemon)
  );
}

export function parseSlimCatalog(value: unknown): SlimCatalogPokemon[] {
  if (Array.isArray(value)) {
    return value as SlimCatalogPokemon[];
  }
  if (isSlimCatalogPayload(value)) {
    return value.pokemon;
  }
  throw new Error("Invalid catalog payload");
}

export function hydrateCatalogPokemon(slim: SlimCatalogPokemon): Pokemon {
  return {
    id: slim.id,
    name: slim.name,
    base_experience: 0,
    height: slim.height,
    weight: slim.weight,
    order: slim.id,
    sprites: {
      front_default: slim.sprites.front_default,
      other: {
        "official-artwork": {
          front_default: slim.sprites.officialArtwork,
        },
        home: {
          front_default: slim.sprites.home,
        },
      },
    },
    types: slim.types.map((name, index) => ({
      slot: index + 1,
      type: { name, url: "" },
    })),
    stats: slim.stats.map((stat) => ({
      base_stat: stat.base,
      effort: 0,
      stat: { name: stat.name, url: "" },
    })),
    abilities: slim.abilities.map((ability) => ({
      is_hidden: ability.is_hidden,
      slot: ability.slot,
      ability: { name: ability.name, url: "" },
    })),
    moves: slim.moves.map((name) => ({
      move: { name, url: "" },
      version_group_details: [],
    })),
    species: { name: slim.name, url: "" },
    forms: [],
  };
}

export function hydrateCatalog(value: unknown): Pokemon[] {
  return parseSlimCatalog(value).map(hydrateCatalogPokemon);
}

export function knownMoveNames(pokemon: {
  moves: Array<string | { move: { name: string } }>;
}): Set<string> {
  return new Set(
    pokemon.moves.map((entry) =>
      typeof entry === "string" ? entry : entry.move.name,
    ),
  );
}
