"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { DexSearch } from "@/components/layout/dex-search";
import { Header } from "@/components/layout/header";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCatalog, useMovesIndex } from "@/features/pokemon/hooks/use-catalog";
import {
  resetCatalogFilters,
  setCatalogFilters,
  useCatalogFilters,
} from "@/features/pokemon/state/catalog-view-store";
import {
  countActiveFilters,
  filterAndSortCatalog,
} from "@/features/pokemon/utils/catalog-filters";
import { titleCase } from "@/features/pokemon/utils/format";
import { ListColumnsHeader } from "@/features/pokemon/components/catalog/list-columns-header";
import { PokemonList } from "@/features/pokemon/components/catalog/pokemon-list";
import { PokemonListSkeleton } from "@/features/pokemon/components/catalog/pokemon-list-skeleton";
import { ResultsBar } from "@/features/pokemon/components/catalog/results-bar";
import { FilterSheet } from "@/features/pokemon/components/filters/filter-sheet";
import { FilterSidebar } from "@/features/pokemon/components/filters/filter-sidebar";

function FiltersButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="relative h-10 gap-2 rounded-xl px-3 sm:h-11 lg:hidden"
      aria-label={count > 0 ? `Filters (${count} active)` : "Filters"}
    >
      <SlidersHorizontal className="size-4" />
      <span className="hidden text-sm font-semibold sm:inline">Filters</span>
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            key={count}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 22 }}
            className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-md"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </Button>
  );
}

export function CatalogView() {
  const filters = useCatalogFilters();
  const catalog = useCatalog();
  const movesIndex = useMovesIndex();
  const isLarge = useMediaQuery("(min-width: 1024px)", true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(
    () => (catalog.data ? filterAndSortCatalog(catalog.data.list, filters) : []),
    [catalog.data, filters],
  );

  const moveLabel = useCallback(
    (slug: string) => movesIndex.data?.moves.get(slug)?.label ?? titleCase(slug),
    [movesIndex.data],
  );

  const moveNames = catalog.data?.moveNames ?? [];
  const activeCount = countActiveFilters(filters);

  return (
    <>
      <Header
        search={
          <DexSearch value={filters.search} onChange={(search) => setCatalogFilters({ search })} />
        }
        actions={<FiltersButton count={activeCount} onClick={() => setSheetOpen(true)} />}
      />

      <main className="mx-auto w-full max-w-7xl px-safe pt-4 pb-28 sm:px-6 sm:pt-6">
        <div className="lg:grid lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-6">
          {isLarge ? (
            <div className="hidden lg:block">
              <FilterSidebar filters={filters} moveNames={moveNames} />
            </div>
          ) : null}

          <section className="min-w-0" aria-label="Pokémon list">
            {catalog.isPending ? (
              <>
                <div className="mb-3 h-7 w-40 skeleton-shimmer rounded-lg" />
                <PokemonListSkeleton />
              </>
            ) : catalog.isError ? (
              <ErrorState
                title="Couldn't load the Pokédex"
                message="The Pokémon list didn't download. Check your connection and try again."
                onRetry={() => void catalog.refetch()}
                retrying={catalog.isFetching}
              />
            ) : (
              <>
                <ResultsBar
                  count={results.length}
                  total={catalog.data.list.length}
                  filters={filters}
                  moveLabel={moveLabel}
                />
                {results.length === 0 ? (
                  <EmptyState
                    title="No Pokémon found"
                    description={
                      filters.search.trim()
                        ? `Nothing matches “${filters.search.trim()}” with the current filters.`
                        : filters.moves.length > 1
                          ? "No Pokémon can learn all of the selected moves together."
                          : "Try removing a filter or two."
                    }
                    action={
                      <Button
                        onClick={() => resetCatalogFilters({ includeSearch: true })}
                        className="mt-1 h-10 rounded-xl px-4"
                      >
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <ListColumnsHeader filters={filters} />
                    <PokemonList
                      items={results}
                      abilities={catalog.data.abilities}
                      filters={filters}
                    />
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      {!isLarge ? (
        <FilterSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          filters={filters}
          moveNames={moveNames}
          resultCount={results.length}
        />
      ) : null}
      <ScrollToTop />
    </>
  );
}
