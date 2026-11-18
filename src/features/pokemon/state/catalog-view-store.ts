import { useSyncExternalStore } from "react";
import {
  DEFAULT_FILTERS,
  type FilterState,
} from "@/features/pokemon/utils/catalog-filters";

/**
 * List view state that must survive navigating to a Pokémon and back:
 * filters (also kept in sessionStorage, so a reload keeps them) and the
 * window scroll position.
 */
type CatalogViewState = {
  filters: FilterState;
  scrollY: number;
};

const SESSION_KEY = "pokedex-catalog-filters-v2";
const listeners = new Set<() => void>();

function readSessionFilters(): FilterState {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const parsed = JSON.parse(raw) as Partial<FilterState>;
    return {
      ...DEFAULT_FILTERS,
      ...parsed,
      types: Array.isArray(parsed.types) ? parsed.types : [],
      sortStats: Array.isArray(parsed.sortStats) ? parsed.sortStats : [],
      moves: Array.isArray(parsed.moves) ? parsed.moves : [],
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

let state: CatalogViewState = {
  filters: readSessionFilters(),
  scrollY: 0,
};

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getFilters = () => state.filters;
const getServerFilters = () => DEFAULT_FILTERS;

export function useCatalogFilters(): FilterState {
  return useSyncExternalStore(subscribe, getFilters, getServerFilters);
}

export function getCatalogFilters(): FilterState {
  return state.filters;
}

export function setCatalogFilters(
  update: Partial<FilterState> | ((filters: FilterState) => FilterState),
) {
  const next =
    typeof update === "function" ? update(state.filters) : { ...state.filters, ...update };
  if (next === state.filters) return;
  state = { ...state, filters: next };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
  emit();
}

/** Clears the panel filters; `includeSearch` also clears the search box. */
export function resetCatalogFilters({ includeSearch = false } = {}) {
  setCatalogFilters((filters) => ({
    ...DEFAULT_FILTERS,
    search: includeSearch ? "" : filters.search,
  }));
}

export function saveCatalogScroll(scrollY: number) {
  state = { ...state, scrollY };
}

export function getSavedCatalogScroll(): number {
  return state.scrollY;
}
