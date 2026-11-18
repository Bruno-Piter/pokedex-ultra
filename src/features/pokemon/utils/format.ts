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

/** Types whose color needs dark text for contrast. */
const LIGHT_TYPES = new Set<string>(["electric", "ice", "ground", "steel", "normal", "bug", "rock", "grass", "fairy"]);

export function isPokemonType(value: string): value is PokemonTypeName {
  return (POKEMON_TYPES as readonly string[]).includes(value);
}

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type as PokemonTypeName] ?? "#888888";
}

export function getTypeTextColor(type: string): string {
  return LIGHT_TYPES.has(type) ? "#1a1a1a" : "#ffffff";
}

export function getPokemonTypeColors(types: readonly string[]): [string, string] {
  const primary = getTypeColor(types[0] ?? "normal");
  const secondary = getTypeColor(types[1] ?? types[0] ?? "normal");
  return [primary, secondary];
}

/** "#006" style national dex number. */
export function formatDexNumber(speciesId: number): string {
  return `#${String(speciesId).padStart(3, "0")}`;
}

export function titleCase(slug: string): string {
  return slug
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatWeight(weight: number): string {
  return `${(weight / 10).toFixed(1)} kg`;
}

export function formatHeight(height: number): string {
  return `${(height / 10).toFixed(1)} m`;
}

/** Female share in % (gender_rate is in eighths), or null when genderless. */
export function getFemaleRatio(genderRate: number): number | null {
  if (genderRate < 0) return null;
  return (genderRate / 8) * 100;
}

export function formatGenderRate(genderRate: number): string {
  const female = getFemaleRatio(genderRate);
  if (female === null) return "Genderless";
  return `${(100 - female).toFixed(1).replace(/\.0$/, "")}% ♂ · ${female.toFixed(1).replace(/\.0$/, "")}% ♀`;
}

/** Chance of catching with a Poké Ball at full HP (Gen 5+ approximation). */
export function getCatchChance(captureRate: number): number {
  return Math.min(100, (captureRate / 3 / 255) * 100);
}

export const GENERATION_RANGES = [
  { gen: 1, label: "Generation I", short: "I", region: "Kanto" },
  { gen: 2, label: "Generation II", short: "II", region: "Johto" },
  { gen: 3, label: "Generation III", short: "III", region: "Hoenn" },
  { gen: 4, label: "Generation IV", short: "IV", region: "Sinnoh" },
  { gen: 5, label: "Generation V", short: "V", region: "Unova" },
  { gen: 6, label: "Generation VI", short: "VI", region: "Kalos" },
  { gen: 7, label: "Generation VII", short: "VII", region: "Alola" },
  { gen: 8, label: "Generation VIII", short: "VIII", region: "Galar" },
  { gen: 9, label: "Generation IX", short: "IX", region: "Paldea" },
] as const;

export function getGenerationLabel(generation: number): string {
  return (
    GENERATION_RANGES.find((range) => range.gen === generation)?.label ??
    `Generation ${generation}`
  );
}
