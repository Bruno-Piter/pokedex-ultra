"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import {
  POKEMON_LIST_MOBILE_MIN_WIDTH,
  POKEMON_LIST_ROW_CLASS,
} from "@/features/pokemon/components/pokemon-list-row-layout";
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
  STAT_COLORS,
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
    filters.statSortDirection,
    filters.sortDirection,
  );
}

function getStatHeaderColor(stat: (typeof LIST_STAT_COLUMNS)[number]): string {
  if (stat === "bst") return STAT_COLORS.hp;
  return STAT_COLORS[stat];
}

function PokemonListHeader({ statSort }: { statSort: StatFilterStat[] }) {
  return (
    <div className="hidden sm:block">
      <div className="glass-card rounded-xl border border-border/50 bg-card/50 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:px-4">
        <div className={POKEMON_LIST_ROW_CLASS}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            #
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/90">
            Name
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/90">
            Type
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground/90">
            Abilities
          </span>
          {LIST_STAT_COLUMNS.map((stat) => {
            const color = getStatHeaderColor(stat);
            const highlighted = isStatColumnHighlighted(stat, statSort);

            return (
              <span
                key={stat}
                className={cn(
                  "flex h-7 min-w-0 items-center justify-center rounded-md px-0.5 text-[10px] font-bold tracking-wide sm:text-[11px]",
                  highlighted &&
                    "ring-1 ring-destructive sm:ring-2",
                )}
                style={{
                  color,
                  backgroundColor: `${color}22`,
                }}
              >
                {LIST_STAT_LABELS[stat]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PokemonGrid({ filters }: PokemonGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const catalogQuery = usePokemonCatalog();

  const sortedCatalog = useMemo(() => {
    if (!catalogQuery.data) return [];
    return filterAndSortCatalog(catalogQuery.data, filters);
  }, [catalogQuery.data, filters]);

  const filterKey = useMemo(
    () =>
      [
        filters.types.join(","),
        filters.generation,
        filters.statSort,
        filters.sort,
        filters.sortDirection,
        filters.statSortDirection,
        filters.search,
      ].join("|"),
    [
      filters.types,
      filters.generation,
      filters.statSort,
      filters.sort,
      filters.sortDirection,
      filters.statSortDirection,
      filters.search,
    ],
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);

  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleCatalog = sortedCatalog.slice(0, visibleCount);
  const hasMoreCatalog = visibleCount < sortedCatalog.length;

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

      <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:overflow-x-visible [&::-webkit-scrollbar]:hidden">
        <div
          className={cn(
            "flex w-full flex-col gap-2",
            POKEMON_LIST_MOBILE_MIN_WIDTH,
            "lg:min-w-0",
          )}
        >
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
