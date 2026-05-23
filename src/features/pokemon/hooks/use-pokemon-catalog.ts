"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAllPokemon } from "@/features/pokemon/api/pokemon.api";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function usePokemonCatalog() {
  return useQuery({
    queryKey: pokeKeys.pokemon.catalog(),
    queryFn: fetchAllPokemon,
    staleTime: Infinity,
  });
}
