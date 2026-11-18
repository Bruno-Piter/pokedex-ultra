import type { StatName } from "@/features/pokemon/types";
import { fetchDataFile } from "@/lib/data/version";

/** Order of the `stats` array in catalog.json. */
export const CATALOG_STAT_ORDER: readonly StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export type FormKind = "mega" | "gmax" | "primal" | "regional" | "other";

/** Bitmask of the sprites PokéAPI has for a Pokémon (see scripts/build-data.mjs). */
export const SPRITE_FLAGS = {
  artwork: 1,
  artworkShiny: 2,
  home: 4,
  homeShiny: 8,
  pixel: 16,
  pixelShiny: 32,
} as const;

type CatalogPayloadPokemon = {
  id: number;
  name: string;
  speciesId: number;
  displayName: string;
  isDefault: boolean;
  generation: number;
  types: string[];
  stats: number[];
  abilities: [string, boolean][];
  height: number;
  weight: number;
  baseExperience: number | null;
  sprites: number;
  moves: number[];
  legendary?: boolean;
  mythical?: boolean;
  baby?: boolean;
  form?: { kind: FormKind; battleOnly: boolean };
};

export type CatalogPayload = {
  version: number;
  generatedAt: string;
  moveNames: string[];
  abilities: Record<string, { name: string; effect?: string }>;
  pokemon: CatalogPayloadPokemon[];
};

export type AbilityInfo = {
  name: string;
  effect: string | null;
};

export type CatalogPokemon = {
  id: number;
  /** PokéAPI slug, e.g. "charizard-mega-x". */
  name: string;
  /** National dex number. */
  speciesId: number;
  /** Official English name, e.g. "Mega Charizard X". */
  displayName: string;
  isDefault: boolean;
  form: { kind: FormKind; battleOnly: boolean } | null;
  generation: number;
  legendary: boolean;
  mythical: boolean;
  baby: boolean;
  types: string[];
  stats: Record<StatName, number>;
  bst: number;
  abilities: { name: string; hidden: boolean }[];
  height: number;
  weight: number;
  baseExperience: number | null;
  sprites: number;
  moves: ReadonlySet<string>;
  /** Normalized text used by the search box. */
  search: string;
};

export type Catalog = {
  generatedAt: string;
  /** Every Pokémon and form, ordered by id. */
  list: CatalogPokemon[];
  byId: ReadonlyMap<number, CatalogPokemon>;
  byName: ReadonlyMap<string, CatalogPokemon>;
  /** Default variety of each species. */
  bySpecies: ReadonlyMap<number, CatalogPokemon>;
  /** Alternate varieties (forms) of each species. */
  formsBySpecies: ReadonlyMap<number, CatalogPokemon[]>;
  /** National dex numbers in ascending order. */
  speciesIds: number[];
  abilities: ReadonlyMap<string, AbilityInfo>;
  /** Every move name learnable by at least one Pokémon, sorted. */
  moveNames: string[];
};

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function hydrateCatalogPokemon(
  entry: CatalogPayloadPokemon,
  moveNames: string[],
): CatalogPokemon {
  const stats = {} as Record<StatName, number>;
  CATALOG_STAT_ORDER.forEach((stat, index) => {
    stats[stat] = entry.stats[index] ?? 0;
  });

  return {
    id: entry.id,
    name: entry.name,
    speciesId: entry.speciesId,
    displayName: entry.displayName,
    isDefault: entry.isDefault,
    form: entry.form ?? null,
    generation: entry.generation,
    legendary: Boolean(entry.legendary),
    mythical: Boolean(entry.mythical),
    baby: Boolean(entry.baby),
    types: entry.types,
    stats,
    bst: entry.stats.reduce((sum, value) => sum + value, 0),
    abilities: entry.abilities.map(([name, hidden]) => ({ name, hidden })),
    height: entry.height,
    weight: entry.weight,
    baseExperience: entry.baseExperience,
    sprites: entry.sprites,
    moves: new Set(entry.moves.map((index) => moveNames[index])),
    search: `${normalizeSearchText(entry.name)} ${normalizeSearchText(entry.displayName)}`,
  };
}

export function hydrateCatalog(payload: CatalogPayload): Catalog {
  if (payload?.version !== 2 || !Array.isArray(payload.pokemon)) {
    throw new Error("Unsupported catalog format");
  }

  const list = payload.pokemon
    .map((entry) => hydrateCatalogPokemon(entry, payload.moveNames))
    .sort((a, b) => a.id - b.id);

  const byId = new Map<number, CatalogPokemon>();
  const byName = new Map<string, CatalogPokemon>();
  const bySpecies = new Map<number, CatalogPokemon>();
  const formsBySpecies = new Map<number, CatalogPokemon[]>();

  for (const pokemon of list) {
    byId.set(pokemon.id, pokemon);
    byName.set(pokemon.name, pokemon);
    if (pokemon.isDefault) {
      bySpecies.set(pokemon.speciesId, pokemon);
    } else {
      const forms = formsBySpecies.get(pokemon.speciesId) ?? [];
      forms.push(pokemon);
      formsBySpecies.set(pokemon.speciesId, forms);
    }
  }

  const abilities = new Map<string, AbilityInfo>(
    Object.entries(payload.abilities ?? {}).map(([slug, ability]) => [
      slug,
      { name: ability.name, effect: ability.effect ?? null },
    ]),
  );

  return {
    generatedAt: payload.generatedAt,
    list,
    byId,
    byName,
    bySpecies,
    formsBySpecies,
    speciesIds: [...bySpecies.keys()].sort((a, b) => a - b),
    abilities,
    moveNames: payload.moveNames,
  };
}

export async function fetchCatalog(signal?: AbortSignal): Promise<Catalog> {
  return hydrateCatalog(await fetchDataFile<CatalogPayload>("catalog.json", signal));
}

/** Finds a Pokémon by numeric id or slug (route params accept both). */
export function findCatalogPokemon(
  catalog: Catalog,
  idOrName: string | number,
): CatalogPokemon | undefined {
  const raw = String(idOrName).trim().toLowerCase();
  if (/^\d+$/.test(raw)) return catalog.byId.get(Number(raw));
  return catalog.byName.get(raw);
}

/** Previous/next species in national dex order (default varieties). */
export function getDexNeighbors(
  catalog: Catalog,
  speciesId: number,
): { prev: CatalogPokemon | null; next: CatalogPokemon | null } {
  const index = catalog.speciesIds.indexOf(speciesId);
  if (index === -1) return { prev: null, next: null };
  const prevId = catalog.speciesIds[index - 1];
  const nextId = catalog.speciesIds[index + 1];
  return {
    prev: prevId !== undefined ? (catalog.bySpecies.get(prevId) ?? null) : null,
    next: nextId !== undefined ? (catalog.bySpecies.get(nextId) ?? null) : null,
  };
}
