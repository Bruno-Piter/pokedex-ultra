"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Sidebar, type FilterState } from "@/components/layout/sidebar";
import { PokemonGrid } from "@/features/pokemon/components/pokemon-grid";
import { usePokemonCatalog } from "@/features/pokemon/hooks/use-pokemon-catalog";

export default function HomePage() {
  usePokemonCatalog();

  const [filters, setFilters] = useState<FilterState>({
    type: null,
    sort: "id",
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Explore every Pokémon
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse, filter, and discover full details for each creature.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <Sidebar filters={filters} onChange={setFilters} />
          <div className="min-w-0 flex-1">
            <PokemonGrid filters={filters} />
          </div>
        </div>
      </main>
    </div>
  );
}
