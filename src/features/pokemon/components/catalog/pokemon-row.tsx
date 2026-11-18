"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link, { useLinkStatus } from "next/link";
import { memo, ViewTransition, type CSSProperties } from "react";
import type { AbilityInfo, CatalogPokemon, FormKind } from "@/lib/data/catalog";
import type { StatFilterStat } from "@/features/pokemon/types";
import { pokemonQuery, speciesQuery } from "@/features/pokemon/api/queries";
import { AbilityTooltip } from "@/features/pokemon/components/ability-tooltip";
import { PokemonArtwork } from "@/features/pokemon/components/pokemon-artwork";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { ROW_GRID } from "@/features/pokemon/components/catalog/row-layout";
import { formatDexNumber, getPokemonTypeColors } from "@/features/pokemon/utils/format";
import {
  getStatValueColor,
  LIST_STAT_COLUMNS,
  STAT_SHORT_LABELS,
} from "@/features/pokemon/utils/stats-calculator";
import { cn } from "@/lib/utils";

export const FORM_KIND_LABELS: Record<FormKind, string> = {
  mega: "Mega Evolution",
  gmax: "Gigantamax",
  primal: "Primal",
  regional: "Regional form",
  other: "Alternate form",
};

/** Thin animated bar shown on the card while its page is loading. */
function PendingHint() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      data-pending={pending}
      className="link-pending absolute inset-x-6 top-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
    />
  );
}

/** Phones have no stat columns: show BST, or the stat(s) being sorted by. */
function MobileMetric({
  pokemon,
  highlightedStats,
}: {
  pokemon: CatalogPokemon;
  highlightedStats: readonly StatFilterStat[];
}) {
  const stats = highlightedStats.length > 0 ? highlightedStats : (["bst"] as const);
  const value = Math.round(
    stats.reduce((sum, stat) => sum + (stat === "bst" ? pokemon.bst : pokemon.stats[stat]), 0) /
      stats.length,
  );
  const label = stats.length > 1 ? "Avg" : STAT_SHORT_LABELS[stats[0]];
  const isTotal = stats.length === 1 && stats[0] === "bst";

  return (
    <div className="flex w-9 flex-col items-center leading-none md:hidden">
      <span className="text-[9px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span
        className="mt-1 font-mono text-sm font-bold tabular-nums"
        style={{ color: getStatValueColor(value, isTotal) }}
      >
        {value}
      </span>
    </div>
  );
}

type PokemonRowProps = {
  pokemon: CatalogPokemon;
  abilities: ReadonlyMap<string, AbilityInfo>;
  highlightedStats: readonly StatFilterStat[];
  /** Entrance animation delay in ms (null = no animation). */
  enterDelay: number | null;
};

export const PokemonRow = memo(function PokemonRow({
  pokemon,
  abilities,
  highlightedStats,
  enterDelay,
}: PokemonRowProps) {
  const queryClient = useQueryClient();
  const [t1, t2] = getPokemonTypeColors(pokemon.types);

  // Start loading the detail data on intent (hover/touch/focus), before the click.
  const prefetch = () => {
    void queryClient.prefetchQuery(pokemonQuery(pokemon.id));
    void queryClient.prefetchQuery(speciesQuery(pokemon.speciesId));
  };

  return (
    <article
      className={cn(
        "type-card group relative h-full rounded-2xl",
        enterDelay !== null && "animate-fade-up",
      )}
      style={
        {
          "--t1": t1,
          "--t2": t2,
          animationDelay: enterDelay ? `${enterDelay}ms` : undefined,
        } as CSSProperties
      }
    >
      <Link
        href={`/pokemon/${pokemon.id}`}
        transitionTypes={["nav-forward"]}
        onPointerEnter={prefetch}
        onTouchStart={prefetch}
        onFocus={prefetch}
        className="absolute inset-0 z-0 rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring"
        aria-label={`${pokemon.displayName}, ${formatDexNumber(pokemon.speciesId)}`}
      >
        <PendingHint />
      </Link>

      <div
        className={cn(
          ROW_GRID,
          "pointer-events-none relative z-10 h-full items-center gap-3 px-3 md:px-4",
        )}
      >
        <ViewTransition name={`pokemon-art-${pokemon.id}`} share="morph" default="none">
          <div className="relative size-14 transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110 group-hover:-rotate-3 md:size-16">
            <PokemonArtwork
              id={pokemon.id}
              alt=""
              flags={pokemon.sprites}
              sizes="64px"
              className="drop-shadow-[0_6px_10px_rgb(0_0_0/0.35)]"
            />
          </div>
        </ViewTransition>

        <div className="min-w-0">
          <p className="font-mono text-[11px] leading-none text-muted-foreground tabular-nums">
            {formatDexNumber(pokemon.speciesId)}
          </p>
          <h3 className="mt-1 truncate font-heading text-[15px] leading-tight font-bold md:text-base">
            {pokemon.displayName}
          </h3>
          {pokemon.form ? (
            <p className="mt-0.5 truncate text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              {FORM_KIND_LABELS[pokemon.form.kind]}
            </p>
          ) : pokemon.legendary || pokemon.mythical ? (
            <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-amber-500 uppercase dark:text-amber-300">
              {pokemon.mythical ? "Mythical" : "Legendary"}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2.5 md:block">
          <MobileMetric pokemon={pokemon} highlightedStats={highlightedStats} />
          <div className="flex flex-col items-end gap-1 md:items-start">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="sm" className="w-[4.5rem]" />
            ))}
          </div>
        </div>

        <div className="pointer-events-auto hidden min-w-0 space-y-0.5 text-[13px] md:block">
          {pokemon.abilities.map((ability) => (
            <AbilityTooltip
              key={ability.name}
              name={ability.name}
              hidden={ability.hidden}
              info={abilities.get(ability.name)}
            />
          ))}
        </div>

        {LIST_STAT_COLUMNS.map((stat) => {
          const value = stat === "bst" ? pokemon.bst : pokemon.stats[stat];
          const highlighted = highlightedStats.includes(stat);
          return (
            <p
              key={stat}
              className={cn(
                "hidden text-center font-mono text-sm tabular-nums md:block",
                stat === "bst" && "font-semibold",
                highlighted && "scale-110 font-bold underline decoration-2 underline-offset-4",
              )}
              style={{ color: getStatValueColor(value, stat === "bst") }}
            >
              {value}
            </p>
          );
        })}
      </div>
    </article>
  );
});
