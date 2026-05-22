"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllVersionGroups } from "@/features/pokemon/api/pokemon.api";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function useVersionGroups() {
  return useQuery({
    queryKey: pokeKeys.versionGroup.list(),
    queryFn: getAllVersionGroups,
    staleTime: Infinity,
  });
}
