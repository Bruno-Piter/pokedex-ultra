"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AbilityInfo, CatalogPokemon } from "@/lib/data/catalog";
import type { StatFilterStat } from "@/features/pokemon/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  getSavedCatalogScroll,
  saveCatalogScroll,
} from "@/features/pokemon/state/catalog-view-store";
import type { FilterState } from "@/features/pokemon/utils/catalog-filters";
import { PokemonRow } from "@/features/pokemon/components/catalog/pokemon-row";
import { ROW_GAP, ROW_HEIGHT } from "@/features/pokemon/components/catalog/row-layout";

type PokemonListProps = {
  items: CatalogPokemon[];
  abilities: ReadonlyMap<string, AbilityInfo>;
  filters: FilterState;
};

const INTRO_ROWS = 10;
const INTRO_DURATION_MS = 700;

function filterSignature(filters: FilterState): string {
  return JSON.stringify([
    filters.search.trim().toLowerCase(),
    filters.types,
    filters.generation,
    filters.showForms,
    filters.sort,
    filters.sortStats,
    filters.direction,
    filters.moves,
  ]);
}

/**
 * Window-scrolled virtual list: only the rows on screen are in the DOM, so
 * scrolling through all ~1,350 entries stays smooth (this replaces the old
 * "load more" pagination). Restores the scroll position when coming back
 * from a Pokémon page.
 */
export function PokemonList({ items, abilities, filters }: PokemonListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)", true);
  const rowHeight = isDesktop ? ROW_HEIGHT.desktop : ROW_HEIGHT.mobile;
  const [scrollMargin, setScrollMargin] = useState(0);

  // Distance from the top of the document to the list (header, results bar…).
  useLayoutEffect(() => {
    const element = listRef.current;
    if (!element) return;
    const update = () =>
      setScrollMargin(Math.round(element.getBoundingClientRect().top + window.scrollY));
    update();
    const observer = new ResizeObserver(update);
    if (element.parentElement) observer.observe(element.parentElement);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => rowHeight,
    gap: ROW_GAP,
    overscan: 6,
    scrollMargin,
    getItemKey: (index) => items[index]?.id ?? index,
    initialOffset: getSavedCatalogScroll,
  });

  useEffect(() => {
    virtualizer.measure();
  }, [rowHeight, virtualizer]);

  // Restore the previous position once, when coming back to the list.
  const restored = useRef(false);
  useLayoutEffect(() => {
    if (restored.current || items.length === 0) return;
    restored.current = true;
    const saved = getSavedCatalogScroll();
    if (saved > 0) window.scrollTo(0, saved);
  }, [items.length]);

  // Remember the position while mounted (layout effect: the listener is gone
  // before the next page renders, so its scroll-to-top isn't recorded).
  useLayoutEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => saveCatalogScroll(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // New filters: jump back to the top of the results and replay the intro.
  const signature = filterSignature(filters);
  const [intro, setIntro] = useState({ signature, active: true });
  if (intro.signature !== signature) {
    setIntro({ signature, active: true });
  }

  const previousSignature = useRef(signature);
  useLayoutEffect(() => {
    if (previousSignature.current === signature) return;
    previousSignature.current = signature;
    const headerHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
    const listTop = Math.max(0, scrollMargin - headerHeight - 140);
    if (window.scrollY > listTop) window.scrollTo({ top: listTop });
  }, [signature, scrollMargin]);

  useEffect(() => {
    if (!intro.active) return;
    const timer = setTimeout(
      () => setIntro((current) => ({ ...current, active: false })),
      INTRO_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [intro.active, intro.signature]);

  const { sort, sortStats } = filters;
  const highlightedStats = useMemo<StatFilterStat[]>(
    () => (sort === "stats" ? (sortStats.length ? sortStats : ["bst"]) : []),
    [sort, sortStats],
  );

  return (
    <div
      ref={listRef}
      className="relative w-full"
      style={{ height: virtualizer.getTotalSize() }}
    >
      {virtualizer.getVirtualItems().map((row) => {
        const pokemon = items[row.index];
        if (!pokemon) return null;
        return (
          <div
            key={row.key}
            className="absolute top-0 left-0 w-full"
            style={{
              height: rowHeight,
              transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
            }}
          >
            <PokemonRow
              pokemon={pokemon}
              abilities={abilities}
              highlightedStats={highlightedStats}
              enterDelay={intro.active && row.index < INTRO_ROWS ? row.index * 35 : null}
            />
          </div>
        );
      })}
    </div>
  );
}
