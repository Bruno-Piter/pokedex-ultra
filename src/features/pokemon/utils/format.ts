import type { FlavorText, LocalizedName, Pokemon } from "@/features/pokemon/types";

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

export function getLocalizedName(
  names: LocalizedName[],
  preferred = "pt-BR",
): string {
  const pt = names.find((n) => n.language.name === preferred);
  if (pt) return pt.name;
  const en = names.find((n) => n.language.name === "en");
  return en?.name ?? names[0]?.name ?? "";
}

export function getFlavorText(
  entries: FlavorText[],
  preferred = "pt-BR",
): string {
  const ptEntries = entries.filter((e) => e.language.name === preferred);
  const pool = ptEntries.length > 0 ? ptEntries : entries.filter((e) => e.language.name === "en");
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
  if (rate === -1) return "Sem gênero";
  const female = (rate / 8) * 100;
  const male = 100 - female;
  return `${male.toFixed(0)}% ♂ / ${female.toFixed(0)}% ♀`;
}

export function sortPokemon(
  pokemon: Pokemon[],
  sort: "id" | "name" | "weight" | "height",
): Pokemon[] {
  return [...pokemon].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "weight":
        return b.weight - a.weight;
      case "height":
        return b.height - a.height;
      default:
        return a.id - b.id;
    }
  });
}

export const GENERATION_RANGES = [
  { gen: 1, label: "Geração I", min: 1, max: 151 },
  { gen: 2, label: "Geração II", min: 152, max: 251 },
  { gen: 3, label: "Geração III", min: 252, max: 386 },
  { gen: 4, label: "Geração IV", min: 387, max: 493 },
  { gen: 5, label: "Geração V", min: 494, max: 649 },
  { gen: 6, label: "Geração VI", min: 650, max: 721 },
  { gen: 7, label: "Geração VII", min: 722, max: 809 },
  { gen: 8, label: "Geração VIII", min: 810, max: 905 },
  { gen: 9, label: "Geração IX", min: 906, max: 1025 },
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
