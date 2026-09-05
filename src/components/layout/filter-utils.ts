import type {
  Pokemon,
  PokemonSortOption,
  SortDirection,
  StatFilterStat,
} from "@/features/pokemon/types";
import {
  filterByGeneration,
  matchesPokemonSearch,
  sortPokemonByStatPriority,
} from "@/features/pokemon/utils/format";

export type MoveFilterSlots = [
  string | null,
  string | null,
  string | null,
  string | null,
];

export const EMPTY_MOVE_FILTERS: MoveFilterSlots = [null, null, null, null];

export type FilterState = {
  types: string[];
  sort: PokemonSortOption;
  sortDirection: SortDirection;
  statSortDirection: SortDirection;
  generation: number | null;
  statSort: StatFilterStat[];
  search: string;
  moves: MoveFilterSlots;
};

export function getSelectedMoves(moves: MoveFilterSlots): string[] {
  return moves.filter((move): move is string => Boolean(move));
}

export function pokemonKnowsAllMoves(
  pokemon: Pokemon,
  moves: string[],
): boolean {
  if (moves.length === 0) return true;
  const known = new Set(pokemon.moves.map((entry) => entry.move.name));
  return moves.every((move) => known.has(move));
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  count += filters.types.length;
  if (filters.generation) count += 1;
  if (filters.statSort.length > 0) count += filters.statSort.length;
  if (filters.statSort.length > 0 && filters.statSortDirection !== "asc") {
    count += 1;
  }
  if (filters.sort !== "id") count += 1;
  if (filters.sortDirection !== "asc") count += 1;
  count += getSelectedMoves(filters.moves).length;
  return count;
}

export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters) > 0;
}

export function filterAndSortCatalog(
  catalog: Pokemon[],
  filters: FilterState,
): Pokemon[] {
  let result = catalog;

  if (filters.search.trim()) {
    result = result.filter((pokemon) =>
      matchesPokemonSearch(pokemon, filters.search),
    );
  }

  if (filters.types.length > 0) {
    result = result.filter((pokemon) =>
      filters.types.every((type) =>
        pokemon.types.some((entry) => entry.type.name === type),
      ),
    );
  }

  const selectedMoves = getSelectedMoves(filters.moves);
  if (selectedMoves.length > 0) {
    result = result.filter((pokemon) =>
      pokemonKnowsAllMoves(pokemon, selectedMoves),
    );
  }

  result = filterByGeneration(result, filters.generation);
  return sortPokemonByStatPriority(
    result,
    filters.statSort,
    filters.sort,
    filters.statSortDirection,
    filters.sortDirection,
  );
}
