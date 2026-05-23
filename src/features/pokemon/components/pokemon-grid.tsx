"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import {
  PokemonGridSkeleton,
} from "@/features/pokemon/components/pokemon-skeleton";
import { ErrorState } from "@/features/pokemon/components/error-state";
import { PAGE_SIZE } from "@/features/pokemon/api/pokemon.api";
import { usePokemonCatalog } from "@/features/pokemon/hooks/use-pokemon-catalog";
import type { FilterState } from "@/components/layout/sidebar";
import type { Pokemon } from "@/features/pokemon/types";
import {
  filterByGeneration,
  sortPokemonByStatPriority,
} from "@/features/pokemon/utils/format";

type PokemonGridProps = {
  filters: FilterState;
};

function filterAndSortCatalog(catalog: Pokemon[], filters: FilterState): Pokemon[] {
  let result = catalog;

  if (filters.type) {
    result = result.filter((pokemon) =>
      pokemon.types.some((entry) => entry.type.name === filters.type),
    );
  }

  result = filterByGeneration(result, filters.generation);
  return sortPokemonByStatPriority(result, filters.statSort, filters.sort);
}

export function PokemonGrid({ filters }: PokemonGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const catalogQuery = usePokemonCatalog();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sortedCatalog = useMemo(() => {
    if (!catalogQuery.data) return [];
    return filterAndSortCatalog(catalogQuery.data, filters);
  }, [catalogQuery.data, filters]);

  const visibleCatalog = sortedCatalog.slice(0, visibleCount);
  const hasMoreCatalog = visibleCount < sortedCatalog.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters.type, filters.generation, filters.statSort, filters.sort]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMoreCatalog) {
          setVisibleCount((count) => count + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreCatalog]);

  if (catalogQuery.isLoading) {
    return (
      <div className="space-y-4">
        <PokemonGridSkeleton count={12} />
        <p className="text-center text-sm text-muted-foreground">
          Carregando catálogo...
        </p>
      </div>
    );
  }

  if (catalogQuery.isError) {
    return <ErrorState onRetry={() => catalogQuery.refetch()} />;
  }

  if (sortedCatalog.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-16 text-center"
      >
        <p className="font-semibold">No Pokémon found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting the selected filters.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
      >
        {visibleCatalog.map((pokemon, index) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} index={index} />
        ))}
      </motion.div>

      <div ref={loadMoreRef} className="flex justify-center py-6">
        {!hasMoreCatalog && (
          <p className="text-sm text-muted-foreground">
            All Pokémon loaded ({sortedCatalog.length})
          </p>
        )}
      </div>
    </div>
  );
}
