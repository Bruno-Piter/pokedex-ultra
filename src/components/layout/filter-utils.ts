import type {
  PokemonSortOption,
  SortDirection,
  StatFilterStat,
} from "@/features/pokemon/types";

export type FilterState = {
  types: string[];
  sort: PokemonSortOption;
  sortDirection: SortDirection;
  statSortDirection: SortDirection;
  generation: number | null;
  statSort: StatFilterStat[];
  search: string;
};

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
  return count;
}

export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters) > 0;
}
