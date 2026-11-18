import { POKEMON_TYPES, type PokemonTypeName } from "@/features/pokemon/utils/format";

/**
 * Type chart (Generation VI onwards): multiplier of an attacking type against
 * a defending type. Only non-neutral matchups are listed. Static data — it
 * used to cost 18 PokéAPI requests per visit.
 */
const ATTACK_CHART: Record<PokemonTypeName, Partial<Record<PokemonTypeName, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export function getAttackMultiplier(
  attackType: PokemonTypeName,
  defendingType: string,
): number {
  return ATTACK_CHART[attackType][defendingType as PokemonTypeName] ?? 1;
}

/** Damage multiplier of an attacking type against a (dual-)typed Pokémon. */
export function getDefensiveMultiplier(
  attackType: PokemonTypeName,
  defendingTypes: readonly string[],
): number {
  return defendingTypes.reduce(
    (total, defendingType) => total * getAttackMultiplier(attackType, defendingType),
    1,
  );
}

export type TypeDefenseEntry = {
  type: PokemonTypeName;
  multiplier: number;
};

export function getTypeDefenses(defendingTypes: readonly string[]): TypeDefenseEntry[] {
  return POKEMON_TYPES.map((type) => ({
    type,
    multiplier: getDefensiveMultiplier(type, defendingTypes),
  }));
}

export type GroupedTypeDefenses = {
  weak: TypeDefenseEntry[];
  resistant: TypeDefenseEntry[];
  immune: TypeDefenseEntry[];
  neutral: TypeDefenseEntry[];
};

export function groupTypeDefenses(defendingTypes: readonly string[]): GroupedTypeDefenses {
  const groups: GroupedTypeDefenses = { weak: [], resistant: [], immune: [], neutral: [] };
  for (const entry of getTypeDefenses(defendingTypes)) {
    if (entry.multiplier === 0) groups.immune.push(entry);
    else if (entry.multiplier > 1) groups.weak.push(entry);
    else if (entry.multiplier < 1) groups.resistant.push(entry);
    else groups.neutral.push(entry);
  }
  groups.weak.sort((a, b) => b.multiplier - a.multiplier);
  groups.resistant.sort((a, b) => a.multiplier - b.multiplier);
  return groups;
}

export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0.25) return "¼×";
  if (multiplier === 0.5) return "½×";
  return `${multiplier}×`;
}
