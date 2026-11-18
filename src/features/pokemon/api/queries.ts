import { queryOptions } from "@tanstack/react-query";
import { fetchCatalog } from "@/lib/data/catalog";
import { fetchMovesIndex } from "@/lib/data/moves";
import {
  getEvolutionChain,
  getPokemon,
  getPokemonSpecies,
} from "@/features/pokemon/api/pokemon.api";

/**
 * Query definitions shared by hooks, prefetching and `ensureQueryData`.
 * Static data (catalog, moves) never goes stale; PokéAPI resources are
 * effectively immutable too, so nothing refetches in the background.
 */
export const queryKeys = {
  catalog: ["data", "catalog"] as const,
  movesIndex: ["data", "moves"] as const,
  pokemon: (idOrName: string | number) =>
    ["pokeapi", "pokemon", String(idOrName).toLowerCase()] as const,
  species: (id: number) => ["pokeapi", "species", id] as const,
  evolutionChain: (id: number) => ["pokeapi", "evolution-chain", id] as const,
};

export function catalogQuery() {
  return queryOptions({
    queryKey: queryKeys.catalog,
    queryFn: ({ signal }) => fetchCatalog(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    // Maps/Sets inside: skip deep structural comparison.
    structuralSharing: false,
  });
}

export function movesIndexQuery() {
  return queryOptions({
    queryKey: queryKeys.movesIndex,
    queryFn: ({ signal }) => fetchMovesIndex(signal),
    staleTime: Infinity,
    gcTime: Infinity,
    structuralSharing: false,
  });
}

export function pokemonQuery(idOrName: string | number) {
  return queryOptions({
    queryKey: queryKeys.pokemon(idOrName),
    queryFn: ({ signal }) => getPokemon(idOrName, signal),
    structuralSharing: false,
  });
}

export function speciesQuery(id: number) {
  return queryOptions({
    queryKey: queryKeys.species(id),
    queryFn: ({ signal }) => getPokemonSpecies(id, signal),
  });
}

export function evolutionChainQuery(id: number) {
  return queryOptions({
    queryKey: queryKeys.evolutionChain(id),
    queryFn: ({ signal }) => getEvolutionChain(id, signal),
  });
}
