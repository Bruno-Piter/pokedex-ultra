"use client";

import { useQuery } from "@tanstack/react-query";
import { getType } from "@/features/pokemon/api/pokemon.api";
import {
  buildTypeEffectivenessChart,
  type TypeEffectivenessChart,
} from "@/features/pokemon/utils/type-effectiveness";
import { POKEMON_TYPES } from "@/features/pokemon/utils/format";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

async function fetchTypeChart(): Promise<TypeEffectivenessChart> {
  const types = await Promise.all(POKEMON_TYPES.map((name) => getType(name)));
  return buildTypeEffectivenessChart(types);
}

export function useTypeChart() {
  return useQuery({
    queryKey: pokeKeys.type.all(),
    queryFn: fetchTypeChart,
    staleTime: Infinity,
  });
}
