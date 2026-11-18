import { normalizeSearchText, type CatalogPokemon } from "@/lib/data/catalog";
import type { SortDirection, StatFilterStat, StatName } from "@/features/pokemon/types";

export type SortField = "id" | "name" | "height" | "weight" | "stats";

export const MAX_TYPE_FILTERS = 2;
export const MAX_MOVE_FILTERS = 4;

export type FilterState = {
  search: string;
  types: string[];
  generation: number | null;
  /** Alternate forms (Megas, regional forms…) are listed next to their species. */
  showForms: boolean;
  sort: SortField;
  /** Stats averaged when `sort` is "stats". */
  sortStats: StatFilterStat[];
  direction: SortDirection;
  /** Pokémon must be able to learn every one of these moves. */
  moves: string[];
};

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  types: [],
  generation: null,
  showForms: true,
  sort: "id",
  sortStats: [],
  direction: "asc",
  moves: [],
};

export function isSortActive(filters: FilterState): boolean {
  return filters.sort !== "id" || filters.direction !== "asc";
}

/** Number of filters set in the panel (search is counted separately). */
export function countActiveFilters(filters: FilterState): number {
  return (
    filters.types.length +
    (filters.generation ? 1 : 0) +
    (filters.showForms ? 0 : 1) +
    filters.moves.length +
    (isSortActive(filters) ? 1 : 0)
  );
}

export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters) > 0 || filters.search.trim() !== "";
}

/**
 * Name, display name or dex number. "25" matches by prefix (25, 250…),
 * "#025"/"025" match exactly; words can come in any order ("mega x").
 */
export function matchesSearch(pokemon: CatalogPokemon, query: string): boolean {
  const raw = query.trim().toLowerCase();
  if (!raw) return true;

  const numeric = raw.replace(/^#/, "");
  if (/^\d+$/.test(numeric)) {
    if (numeric.startsWith("0")) return pokemon.speciesId === Number(numeric);
    return String(pokemon.speciesId).startsWith(numeric);
  }

  const tokens = normalizeSearchText(raw).split(" ").filter(Boolean);
  return tokens.every((token) => pokemon.search.includes(token));
}

export function getStatValue(pokemon: CatalogPokemon, stat: StatFilterStat): number {
  return stat === "bst" ? pokemon.bst : pokemon.stats[stat as StatName];
}

export function getStatAverage(pokemon: CatalogPokemon, stats: StatFilterStat[]): number {
  if (stats.length === 0) return pokemon.bst;
  return stats.reduce((sum, stat) => sum + getStatValue(pokemon, stat), 0) / stats.length;
}

function byDexNumber(a: CatalogPokemon, b: CatalogPokemon): number {
  return a.speciesId - b.speciesId || Number(b.isDefault) - Number(a.isDefault) || a.id - b.id;
}

export function sortCatalog(list: CatalogPokemon[], filters: FilterState): CatalogPokemon[] {
  const sign = filters.direction === "asc" ? 1 : -1;
  const statScore =
    filters.sort === "stats"
      ? new Map(list.map((pokemon) => [pokemon.id, getStatAverage(pokemon, filters.sortStats)]))
      : null;

  return [...list].sort((a, b) => {
    let diff = 0;
    switch (filters.sort) {
      case "name":
        diff = a.displayName.localeCompare(b.displayName);
        break;
      case "height":
        diff = a.height - b.height;
        break;
      case "weight":
        diff = a.weight - b.weight;
        break;
      case "stats":
        diff = statScore!.get(a.id)! - statScore!.get(b.id)!;
        break;
      default:
        diff = byDexNumber(a, b);
    }
    return diff !== 0 ? sign * diff : byDexNumber(a, b);
  });
}

export function filterCatalog(list: CatalogPokemon[], filters: FilterState): CatalogPokemon[] {
  const search = filters.search.trim();
  return list.filter(
    (pokemon) =>
      (filters.showForms || pokemon.isDefault) &&
      (!filters.generation || pokemon.generation === filters.generation) &&
      filters.types.every((type) => pokemon.types.includes(type)) &&
      filters.moves.every((move) => pokemon.moves.has(move)) &&
      (!search || matchesSearch(pokemon, search)),
  );
}

export function filterAndSortCatalog(
  list: CatalogPokemon[],
  filters: FilterState,
): CatalogPokemon[] {
  return sortCatalog(filterCatalog(list, filters), filters);
}

export function isStatHighlighted(stat: StatFilterStat, filters: FilterState): boolean {
  return filters.sort === "stats" && filters.sortStats.includes(stat);
}
