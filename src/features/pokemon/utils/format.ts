import type {
  FlavorText,
  LocalizedName,
  Pokemon,
  PokemonSortOption,
  StatFilterStat,
} from "@/features/pokemon/types";

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export const TYPE_COLORS: Record<PokemonTypeName, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type as PokemonTypeName] ?? "#888888";
}

export function getPokemonTypeColors(
  types: { type: { name: string } }[],
): [string, string] {
  const primary = getTypeColor(types[0]?.type.name ?? "normal");
  const secondary = getTypeColor(
    types[1]?.type.name ?? types[0]?.type.name ?? "normal",
  );
  return [primary, secondary];
}

export function getLocalizedName(
  names: LocalizedName[],
  preferred = "en",
): string {
  const match = names.find((n) => n.language.name === preferred);
  if (match) return match.name;
  const en = names.find((n) => n.language.name === "en");
  return en?.name ?? names[0]?.name ?? "";
}

export function getFlavorText(
  entries: FlavorText[],
  preferred = "en",
): string {
  const preferredEntries = entries.filter((e) => e.language.name === preferred);
  const pool =
    preferredEntries.length > 0
      ? preferredEntries
      : entries.filter((e) => e.language.name === "en");
  const latest = pool[pool.length - 1];
  return latest?.flavor_text.replace(/\f/g, " ").replace(/\n/g, " ") ?? "";
}

export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

export function formatWeight(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`;
}

export function formatHeight(height: number): string {
  return `${(height / 10).toFixed(1)} m`;
}

export function formatGenderRate(rate: number): string {
  if (rate === -1) return "Genderless";
  const female = (rate / 8) * 100;
  const male = 100 - female;
  return `${male.toFixed(0)}% ♂ / ${female.toFixed(0)}% ♀`;
}

export function getPokemonStatValue(
  pokemon: Pokemon,
  stat: StatFilterStat,
): number {
  if (stat === "bst") {
    return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  }
  return pokemon.stats.find((s) => s.stat.name === stat)?.base_stat ?? 0;
}

export function getPokemonStatAverage(
  pokemon: Pokemon,
  stats: StatFilterStat[],
): number {
  if (stats.length === 0) return 0;
  const total = stats.reduce(
    (sum, stat) => sum + getPokemonStatValue(pokemon, stat),
    0,
  );
  return total / stats.length;
}

function comparePokemon(
  a: Pokemon,
  b: Pokemon,
  sort: PokemonSortOption,
): number {
  switch (sort) {
    case "name":
      return a.name.localeCompare(b.name);
    case "weight":
      return b.weight - a.weight;
    case "height":
      return b.height - a.height;
    case "hp":
    case "attack":
    case "defense":
    case "special-attack":
    case "special-defense":
    case "speed":
    case "bst":
      return getPokemonStatValue(b, sort) - getPokemonStatValue(a, sort);
    default:
      return a.id - b.id;
  }
}

export function sortPokemon(
  pokemon: Pokemon[],
  sort: PokemonSortOption,
): Pokemon[] {
  return [...pokemon].sort((a, b) => comparePokemon(a, b, sort));
}

export function sortPokemonByStatPriority(
  pokemon: Pokemon[],
  statPriority: StatFilterStat[],
  fallbackSort: PokemonSortOption,
): Pokemon[] {
  if (statPriority.length === 0) {
    return sortPokemon(pokemon, fallbackSort);
  }

  return [...pokemon].sort((a, b) => {
    const diff =
      getPokemonStatAverage(b, statPriority) -
      getPokemonStatAverage(a, statPriority);
    if (diff !== 0) return diff;
    return comparePokemon(a, b, fallbackSort);
  });
}

export const GENERATION_RANGES = [
  { gen: 1, label: "Generation I", min: 1, max: 151 },
  { gen: 2, label: "Generation II", min: 152, max: 251 },
  { gen: 3, label: "Generation III", min: 252, max: 386 },
  { gen: 4, label: "Generation IV", min: 387, max: 493 },
  { gen: 5, label: "Generation V", min: 494, max: 649 },
  { gen: 6, label: "Generation VI", min: 650, max: 721 },
  { gen: 7, label: "Generation VII", min: 722, max: 809 },
  { gen: 8, label: "Generation VIII", min: 810, max: 905 },
  { gen: 9, label: "Generation IX", min: 906, max: 1025 },
] as const;

export function filterByGeneration(
  pokemon: Pokemon[],
  generation: number | null,
): Pokemon[] {
  if (!generation) return pokemon;
  const range = GENERATION_RANGES.find((g) => g.gen === generation);
  if (!range) return pokemon;
  return pokemon.filter((p) => p.id >= range.min && p.id <= range.max);
}
