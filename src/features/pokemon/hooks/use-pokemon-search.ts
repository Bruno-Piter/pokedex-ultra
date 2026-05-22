"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAllPokemonNames,
  getPokemonByIdOrName,
} from "@/features/pokemon/api/pokemon.api";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function usePokemonSearchIndex() {
  return useQuery({
    queryKey: [...pokeKeys.pokemon.all(), "index"],
    queryFn: getAllPokemonNames,
    staleTime: Infinity,
  });
}

export function usePokemonSearch(query: string) {
  return useQuery({
    queryKey: pokeKeys.pokemon.search(query),
    queryFn: () => getPokemonByIdOrName(query.toLowerCase()),
    enabled: query.length >= 2,
  });
}
