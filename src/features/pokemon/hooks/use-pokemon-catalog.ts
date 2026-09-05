"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/features/pokemon/api/pokemon.api";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function usePokemonCatalog() {
  return useQuery({
    queryKey: pokeKeys.pokemon.catalog(),
    queryFn: fetchCatalog,
    staleTime: Infinity,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}
