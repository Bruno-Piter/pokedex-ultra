"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import { POKEMON_LIST_ROW_CLASS } from "@/features/pokemon/components/pokemon-list-row-layout";
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
  matchesPokemonSearch,
  sortPokemonByStatPriority,
} from "@/features/pokemon/utils/format";
import {
  isStatColumnHighlighted,
  LIST_STAT_COLUMNS,
  LIST_STAT_LABELS,
} from "@/features/pokemon/utils/stats-calculator";
import type { StatFilterStat } from "@/features/pokemon/types";
import { cn } from "@/lib/utils";

type PokemonGridProps = {
  filters: FilterState;
};

function filterAndSortCatalog(catalog: Pokemon[], filters: FilterState): Pokemon[] {
  let result = catalog;

  if (filters.search.trim()) {
    result = result.filter((pokemon) =>
      matchesPokemonSearch(pokemon, filters.search),
    );
  }

  if (filters.types.length > 0) {
    result = result.filter((pokemon) =>
      filters.types.every((type) =>
        pokemon.types.some((entry) => entry.type.name === type),
      ),
    );
  }

  result = filterByGeneration(result, filters.generation);
  return sortPokemonByStatPriority(
    result,
    filters.statSort,
    filters.sort,
    filters.sortDirection,
  );
}

function PokemonListHeader({ statSort }: { statSort: StatFilterStat[] }) {
  return (
    <div className="hidden overflow-hidden px-3 sm:block sm:px-4">
      <div
        className={`${POKEMON_LIST_ROW_CLASS} border-b border-border/50 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground`}
      >
        <span />
        <span>Name</span>
        <span>Type</span>
        <span>Abilities</span>
        {LIST_STAT_COLUMNS.map((stat) => (
          <span
            key={stat}
            className={cn(
              "text-center",
              isStatColumnHighlighted(stat, statSort) && "text-destructive",
            )}
          >
            {LIST_STAT_LABELS[stat]}
          </span>
        ))}
      </div>
    </div>
  );
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
  }, [
    filters.types,
    filters.generation,
    filters.statSort,
    filters.sort,
    filters.sortDirection,
    filters.search,
  ]);

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
        <p className="font-semibold">Nenhum Pokémon encontrado</p>
        <p className="text-sm text-muted-foreground">
          {filters.search.trim()
            ? `Nenhum resultado para "${filters.search.trim()}".`
            : "Tente ajustar os filtros selecionados."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {filters.search.trim() ? (
        <p className="text-sm text-muted-foreground">
          {sortedCatalog.length} resultado{sortedCatalog.length === 1 ? "" : "s"} para &quot;{filters.search.trim()}&quot;
        </p>
      ) : null}

      <div className="overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-x-visible [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-[680px] flex-col gap-2 sm:min-w-0">
          <PokemonListHeader statSort={filters.statSort} />

          {visibleCatalog.map((pokemon, index) => (
            <PokemonCard
              key={pokemon.id}
              pokemon={pokemon}
              index={index}
              statSort={filters.statSort}
            />
          ))}
        </div>
      </div>

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
