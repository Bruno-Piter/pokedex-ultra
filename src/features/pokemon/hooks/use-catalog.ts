"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogQuery, movesIndexQuery } from "@/features/pokemon/api/queries";

export function useCatalog() {
  return useQuery(catalogQuery());
}

export function useMovesIndex(enabled = true) {
  return useQuery({ ...movesIndexQuery(), enabled });
}
