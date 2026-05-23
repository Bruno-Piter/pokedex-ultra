"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  PAGE_SIZE,
  fetchPokemonBatch,
  fetchPokemonByType,
  getPokemonList,
} from "@/features/pokemon/api/pokemon.api";
import type { Pokemon } from "@/features/pokemon/types";
import {
  filterByGeneration,
  sortPokemon,
} from "@/features/pokemon/utils/format";
import { pokeKeys, type PokemonListFilters } from "@/lib/pokeapi/query-keys";

export function usePokemonList(
  filters: PokemonListFilters & { generation?: number | null },
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: pokeKeys.pokemon.list(filters),
    enabled: options?.enabled ?? true,
    queryFn: async ({ pageParam = 0 }) => {
      const applyFilters = (batch: Pokemon[]) => {
        let pokemon = sortPokemon(batch, filters.sort);
        pokemon = filterByGeneration(pokemon, filters.generation ?? null);
        return pokemon;
      };

      if (filters.type) {
        const { pokemon, total } = await fetchPokemonByType(
          filters.type,
          pageParam,
          PAGE_SIZE,
        );
        const filtered = applyFilters(pokemon);
        return {
          pokemon: filtered,
          nextOffset: pageParam + PAGE_SIZE < total ? pageParam + PAGE_SIZE : null,
          total,
        };
      }

      const list = await getPokemonList(pageParam, PAGE_SIZE);
      const batch = await fetchPokemonBatch(list.results.map((r) => r.url));
      let pokemon = applyFilters(batch);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        pokemon = pokemon.filter((p) => p.name.includes(q));
      }

      return {
        pokemon,
        nextOffset: list.next ? pageParam + PAGE_SIZE : null,
        total: list.count,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });
}
