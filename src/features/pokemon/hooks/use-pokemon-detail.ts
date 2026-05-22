"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAbility,
  getEvolutionChain,
  getMove,
  getPokemonByIdOrName,
  getPokemonSpecies,
} from "@/features/pokemon/api/pokemon.api";
import { extractIdFromUrl } from "@/lib/pokeapi/client";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function usePokemonDetail(idOrName: string) {
  const pokemonQuery = useQuery({
    queryKey: pokeKeys.pokemon.detail(idOrName),
    queryFn: () => getPokemonByIdOrName(idOrName),
  });

  const speciesId = pokemonQuery.data?.species
    ? extractIdFromUrl(pokemonQuery.data.species.url)
    : null;

  const speciesQuery = useQuery({
    queryKey: pokeKeys.pokemon.species(speciesId ?? 0),
    queryFn: () => getPokemonSpecies(speciesId!),
    enabled: speciesId !== null,
  });

  const evolutionId = speciesQuery.data?.evolution_chain
    ? extractIdFromUrl(speciesQuery.data.evolution_chain.url)
    : null;

  const evolutionQuery = useQuery({
    queryKey: pokeKeys.evolution.detail(evolutionId ?? 0),
    queryFn: () => getEvolutionChain(evolutionId!),
    enabled: evolutionId !== null,
  });

  return {
    pokemon: pokemonQuery.data,
    species: speciesQuery.data,
    evolution: evolutionQuery.data,
    isLoading:
      pokemonQuery.isLoading ||
      speciesQuery.isLoading ||
      evolutionQuery.isLoading,
    isError: pokemonQuery.isError,
    error: pokemonQuery.error,
    refetch: pokemonQuery.refetch,
  };
}

export function useAbility(name: string, enabled = true) {
  return useQuery({
    queryKey: pokeKeys.ability.detail(name),
    queryFn: () => getAbility(name),
    enabled,
  });
}

export function useMove(name: string, enabled = true) {
  return useQuery({
    queryKey: pokeKeys.move.detail(name),
    queryFn: () => getMove(name),
    enabled,
  });
}
