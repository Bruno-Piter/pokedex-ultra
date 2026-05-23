import type { TypeData } from "@/features/pokemon/types";
import { POKEMON_TYPES, type PokemonTypeName } from "@/features/pokemon/utils/format";

export type TypeEffectivenessChart = Record<
  PokemonTypeName,
  Record<PokemonTypeName, number>
>;

export type TypeDefenseEntry = {
  type: PokemonTypeName;
  multiplier: number;
  label: string | null;
};

export const TYPE_ABBREVIATIONS: Record<PokemonTypeName, string> = {
  normal: "NOR",
  fire: "FIR",
  water: "WAT",
  electric: "ELE",
  grass: "GRA",
  ice: "ICE",
  fighting: "FIG",
  poison: "POI",
  ground: "GRO",
  flying: "FLY",
  psychic: "PSY",
  bug: "BUG",
  rock: "ROC",
  ghost: "GHO",
  dragon: "DRA",
  dark: "DAR",
  steel: "STE",
  fairy: "FAI",
};

export function formatTypeMultiplier(multiplier: number): string | null {
  if (multiplier === 1) return null;
  if (multiplier === 0) return "0";
  if (multiplier === 0.25) return "¼";
  if (multiplier === 0.5) return "½";
  if (multiplier === 2) return "2";
  if (multiplier === 4) return "4";
  return String(multiplier);
}

export function buildTypeEffectivenessChart(
  types: TypeData[],
): TypeEffectivenessChart {
  const chart = {} as TypeEffectivenessChart;

  for (const defendType of POKEMON_TYPES) {
    chart[defendType] = {} as Record<PokemonTypeName, number>;
    for (const attackType of POKEMON_TYPES) {
      chart[defendType][attackType] = 1;
    }
  }

  for (const typeData of types) {
    const defendType = typeData.name as PokemonTypeName;
    if (!chart[defendType]) continue;

    for (const entry of typeData.damage_relations.double_damage_from) {
      const attackType = entry.name as PokemonTypeName;
      if (chart[defendType][attackType] !== undefined) {
        chart[defendType][attackType] = 2;
      }
    }

    for (const entry of typeData.damage_relations.half_damage_from) {
      const attackType = entry.name as PokemonTypeName;
      if (chart[defendType][attackType] !== undefined) {
        chart[defendType][attackType] = 0.5;
      }
    }

    for (const entry of typeData.damage_relations.no_damage_from) {
      const attackType = entry.name as PokemonTypeName;
      if (chart[defendType][attackType] !== undefined) {
        chart[defendType][attackType] = 0;
      }
    }
  }

  return chart;
}

export function getDefensiveMultiplier(
  attackType: PokemonTypeName,
  defendingTypes: PokemonTypeName[],
  chart: TypeEffectivenessChart,
): number {
  return defendingTypes.reduce(
    (total, defendType) => total * (chart[defendType]?.[attackType] ?? 1),
    1,
  );
}

export function getTypeDefenses(
  defendingTypes: PokemonTypeName[],
  chart: TypeEffectivenessChart,
): TypeDefenseEntry[] {
  return POKEMON_TYPES.map((type) => {
    const multiplier = getDefensiveMultiplier(type, defendingTypes, chart);
    return {
      type,
      multiplier,
      label: formatTypeMultiplier(multiplier),
    };
  });
}
