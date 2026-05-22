"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  buildTmMapForVersionGroup,
  fetchMovesByName,
} from "@/features/pokemon/api/pokemon.api";
import type { MoveSection, PokemonMove } from "@/features/pokemon/types";
import {
  enrichMoves,
  groupMovesByMethod,
  normalizeMovesForVersionGroup,
} from "@/features/pokemon/utils/move-groups";
import {
  getVersionGroupLabel,
  resolveLatestVersionGroup,
} from "@/features/pokemon/utils/version-group";
import { useVersionGroups } from "@/features/pokemon/hooks/use-version-groups";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

export function usePokemonMoves(moves: PokemonMove[] | undefined) {
  const versionGroupsQuery = useVersionGroups();

  const latestVersionGroup = useMemo(() => {
    if (!moves || !versionGroupsQuery.data) return null;
    return resolveLatestVersionGroup(moves, versionGroupsQuery.data);
  }, [moves, versionGroupsQuery.data]);

  const normalizedMoves = useMemo(() => {
    if (!moves || !latestVersionGroup) return [];
    return normalizeMovesForVersionGroup(moves, latestVersionGroup.name);
  }, [moves, latestVersionGroup]);

  const uniqueMoveNames = useMemo(
    () => [...new Set(normalizedMoves.map((m) => m.name))],
    [normalizedMoves],
  );

  const moveDetailsQuery = useQuery({
    queryKey: [
      ...pokeKeys.move.detail("batch"),
      latestVersionGroup?.name,
      uniqueMoveNames,
    ],
    queryFn: () => fetchMovesByName(uniqueMoveNames),
    enabled: uniqueMoveNames.length > 0 && !!latestVersionGroup,
    staleTime: 1000 * 60 * 60,
  });

  const tmMapQuery = useQuery({
    queryKey: [
      ...pokeKeys.machine.byVersionGroup(
        latestVersionGroup?.name ?? "unknown",
      ),
      uniqueMoveNames,
    ],
    queryFn: async () => {
      const moveDetails = [...(moveDetailsQuery.data?.values() ?? [])];
      const machineMoves = moveDetails.filter((move) =>
        normalizedMoves.some(
          (entry) =>
            entry.name === move.name && entry.method === "machine",
        ),
      );
      return buildTmMapForVersionGroup(
        machineMoves,
        latestVersionGroup!.name,
      );
    },
    enabled:
      !!latestVersionGroup &&
      !!moveDetailsQuery.data &&
      normalizedMoves.some((m) => m.method === "machine"),
    staleTime: Infinity,
  });

  const sections: MoveSection[] = useMemo(() => {
    if (!moveDetailsQuery.data) return [];
    const enriched = enrichMoves(
      normalizedMoves,
      moveDetailsQuery.data,
      tmMapQuery.data ?? new Map(),
    );
    return groupMovesByMethod(enriched);
  }, [normalizedMoves, moveDetailsQuery.data, tmMapQuery.data]);

  return {
    sections,
    versionGroupLabel: latestVersionGroup
      ? getVersionGroupLabel(latestVersionGroup.name)
      : null,
    isLoading:
      versionGroupsQuery.isLoading ||
      moveDetailsQuery.isLoading ||
      tmMapQuery.isLoading,
    isError: versionGroupsQuery.isError || moveDetailsQuery.isError,
  };
}
