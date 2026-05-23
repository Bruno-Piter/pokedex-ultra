"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { PokemonCard } from "@/features/pokemon/components/pokemon-card";
import {
  PokemonGridSkeleton,
} from "@/features/pokemon/components/pokemon-skeleton";
import { ErrorState } from "@/features/pokemon/components/error-state";
import { usePokemonList } from "@/features/pokemon/hooks/use-pokemon-list";
import type { FilterState } from "@/components/layout/sidebar";

type PokemonGridProps = {
  filters: FilterState;
};

export function PokemonGrid({ filters }: PokemonGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    usePokemonList({
      type: filters.type ?? undefined,
      sort: filters.sort,
      generation: filters.generation,
      statMin: filters.statMin,
    });

  const allPokemon = data?.pages.flatMap((p) => p.pokemon) ?? [];

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <PokemonGridSkeleton count={12} />;

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (allPokemon.length === 0) {
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
        {allPokemon.map((pokemon, index) => (
          <PokemonCard key={`${pokemon.id}-${index}`} pokemon={pokemon} index={index} />
        ))}
      </motion.div>

      <div ref={loadMoreRef} className="flex justify-center py-6">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading more...
          </div>
        )}
        {!hasNextPage && allPokemon.length > 0 && (
          <p className="text-sm text-muted-foreground">
            All Pokémon loaded ({allPokemon.length})
          </p>
        )}
      </div>
    </div>
  );
}
