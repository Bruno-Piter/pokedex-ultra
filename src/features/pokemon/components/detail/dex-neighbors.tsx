"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { getDexNeighbors, type Catalog, type CatalogPokemon } from "@/lib/data/catalog";
import { pokemonQuery, speciesQuery } from "@/features/pokemon/api/queries";
import { PokemonArtwork } from "@/features/pokemon/components/pokemon-artwork";
import { formatDexNumber } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

function hrefFor(pokemon: CatalogPokemon, tab: string) {
  return `/pokemon/${pokemon.id}${tab !== "overview" ? `?tab=${tab}` : ""}`;
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    !!target.closest("input, textarea, select, [contenteditable='true'], [role='listbox'], [role='tablist']")
  );
}

/**
 * Previous/next Pokémon in dex order. Navigation replaces the history entry,
 * so flipping through Pokémon and pressing Back returns to the list.
 */
export function useDexNavigation(catalog: Catalog | undefined, speciesId: number, tab: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { prev, next } = catalog ? getDexNeighbors(catalog, speciesId) : { prev: null, next: null };

  const go = useCallback(
    (direction: -1 | 1) => {
      const target = direction === 1 ? next : prev;
      if (!target) return;
      router.replace(hrefFor(target, tab), {
        transitionTypes: [direction === 1 ? "nav-forward" : "nav-back"],
      });
    },
    [next, prev, router, tab],
  );

  // Warm up the neighbors once this page has settled.
  useEffect(() => {
    const timer = setTimeout(() => {
      for (const neighbor of [prev, next]) {
        if (!neighbor) continue;
        router.prefetch(hrefFor(neighbor, tab));
        void queryClient.prefetchQuery(pokemonQuery(neighbor.id));
        void queryClient.prefetchQuery(speciesQuery(neighbor.speciesId));
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [prev, next, router, queryClient, tab]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  return { prev, next, go };
}

function NeighborLink({
  pokemon,
  direction,
  tab,
}: {
  pokemon: CatalogPokemon | null;
  direction: "prev" | "next";
  tab: string;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;

  if (!pokemon) {
    return <span className="h-11 w-11 sm:w-36" aria-hidden />;
  }

  return (
    <Link
      href={hrefFor(pokemon, tab)}
      replace
      transitionTypes={[direction === "next" ? "nav-forward" : "nav-back"]}
      className={cn(
        "group flex h-11 items-center gap-1.5 rounded-2xl border border-border/60 bg-card/60 px-1.5 text-left transition-[background-color,transform] hover:bg-card active:scale-95 sm:px-2",
        direction === "next" && "flex-row-reverse text-right",
      )}
      aria-label={`${direction === "prev" ? "Previous" : "Next"}: ${pokemon.displayName}`}
    >
      <Icon
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          direction === "prev" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5",
        )}
      />
      <span className="relative size-8 shrink-0">
        <PokemonArtwork id={pokemon.id} alt="" flags={pokemon.sprites} sizes="32px" />
      </span>
      <span className="hidden min-w-0 leading-tight sm:block">
        <span className="block font-mono text-[10px] text-muted-foreground tabular-nums">
          {formatDexNumber(pokemon.speciesId)}
        </span>
        <span className="block max-w-24 truncate text-xs font-semibold">{pokemon.displayName}</span>
      </span>
    </Link>
  );
}

export function DexNeighbors({
  prev,
  next,
  tab,
}: {
  prev: CatalogPokemon | null;
  next: CatalogPokemon | null;
  tab: string;
}) {
  return (
    <nav className="flex items-center gap-2" aria-label="Browse Pokédex">
      <NeighborLink pokemon={prev} direction="prev" tab={tab} />
      <NeighborLink pokemon={next} direction="next" tab={tab} />
    </nav>
  );
}
