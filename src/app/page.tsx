"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar, type FilterState } from "@/components/layout/sidebar";
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
  });

  return (
    <div className="min-h-screen bg-mesh">
      <Header
        search={filters.search}
        onSearchChange={(search) => setFilters((current) => ({ ...current, search }))}
      />
      <main className="mx-auto max-w-7xl px-4 pt-3 pb-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <Sidebar filters={filters} onChange={setFilters} />
          <div className="min-w-0 flex-1">
            <PokemonGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  );
}
