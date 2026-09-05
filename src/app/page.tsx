"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar, type FilterState } from "@/components/layout/sidebar";
import {
  countActiveFilters,
  EMPTY_MOVE_FILTERS,
} from "@/components/layout/filter-utils";
import { PokemonGrid } from "@/features/pokemon/components/pokemon-grid";
import { usePokemonCatalog } from "@/features/pokemon/hooks/use-pokemon-catalog";

export default function HomePage() {
  usePokemonCatalog();

  const [filters, setFilters] = useState<FilterState>({
    types: [],
    sort: "id",
    sortDirection: "asc",
    statSortDirection: "asc",
    generation: null,
    statSort: [],
    search: "",
    moves: EMPTY_MOVE_FILTERS,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="flex h-screen max-h-[100dvh] flex-col overflow-hidden bg-mesh">
      <Header
        search={filters.search}
        onSearchChange={(search) =>
          setFilters((current) => ({ ...current, search }))
        }
        activeFilterCount={activeFilterCount}
        onOpenFilters={() => setFiltersOpen(true)}
      />
      <main
        className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col pt-3 pb-safe pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          <Sidebar
            filters={filters}
            onChange={setFilters}
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
          />
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pb-4">
            <PokemonGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  );
}