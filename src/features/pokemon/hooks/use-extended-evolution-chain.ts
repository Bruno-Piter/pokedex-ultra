"use client";

import { useQuery } from "@tanstack/react-query";
import { buildExtendedEvolutionChain } from "@/features/pokemon/utils/evolution-chain";
import type { ChainLink } from "@/features/pokemon/types";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function useExtendedEvolutionChain(
  chain: ChainLink | undefined,
  evolutionChainId: number | undefined,
) {
  return useQuery({
    queryKey: pokeKeys.evolution.extended(evolutionChainId ?? 0),
    queryFn: () => buildExtendedEvolutionChain(chain!),
    enabled: !!chain && !!evolutionChainId,
    staleTime: 1000 * 60 * 60,
  });
}
