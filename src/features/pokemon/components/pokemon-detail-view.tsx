"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState } from "@/features/pokemon/components/error-state";
import { AbilityTooltip } from "@/features/pokemon/components/ability-tooltip";
import { EvolutionTree } from "@/features/pokemon/components/evolution-tree";
import { MovesTable } from "@/features/pokemon/components/moves-table";
import { PokemonOverview } from "@/features/pokemon/components/pokemon-overview";
import { PokemonGridSkeleton } from "@/features/pokemon/components/pokemon-skeleton";
import { PokemonSpriteImage } from "@/features/pokemon/components/pokemon-sprite-image";
import { StatsBars } from "@/features/pokemon/components/stats-bars";
import { StatsRangeTable } from "@/features/pokemon/components/stats-range-table";
import { StatsRadar } from "@/features/pokemon/components/stats-radar";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { TypeCardGlow } from "@/features/pokemon/components/type-card-glow";
import { usePokemonDetail } from "@/features/pokemon/hooks/use-pokemon-detail";
import {
  formatHeight,
  formatPokemonId,
  formatWeight,
  getLocalizedName,
  getPokemonTypeColors,
} from "@/features/pokemon/utils/format";

type PokemonDetailViewProps = {
  id: string;
};

export function PokemonDetailView({ id }: PokemonDetailViewProps) {
  const { pokemon, species, evolution, isLoading, isError, refetch } =
    usePokemonDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <PokemonGridSkeleton count={1} />
      </div>
    );
  }

  if (isError || !pokemon || !species) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ErrorState
          message="Could not load this Pokémon."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const displayName =
    getLocalizedName(species.names) || pokemon.name.replace(/-/g, " ");
  const [primaryColor, secondaryColor] = getPokemonTypeColors(pokemon.types);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Pokédex
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)] lg:gap-8">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="group glass-card relative overflow-hidden rounded-2xl bg-card/60 p-6 backdrop-blur-sm"
          style={{
            boxShadow: `0 0 0 1px ${primaryColor}44, 0 8px 40px ${primaryColor}33, 0 8px 40px ${secondaryColor}33`,
          }}
        >
          <TypeCardGlow
            colors={[primaryColor, secondaryColor]}
            size="lg"
          />

          <div className="relative z-10 space-y-4">
            <div>
              <p className="font-mono text-sm text-muted-foreground">
                {formatPokemonId(pokemon.id)}
              </p>
              <h1 className="font-heading text-2xl font-bold capitalize sm:text-3xl">
                {displayName}
              </h1>
              {displayName !== pokemon.name.replace(/-/g, " ") && (
                <p className="text-sm capitalize text-muted-foreground">
                  {pokemon.name.replace(/-/g, " ")}
                </p>
              )}
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="relative mx-auto aspect-square w-full max-w-[240px]"
            >
              <PokemonSpriteImage
                pokemon={pokemon}
                alt={displayName}
                fill
                sizes="240px"
                priority
                className="object-contain drop-shadow-2xl"
              />
            </motion.div>

            <div className="flex flex-wrap gap-2">
              {pokemon.types.map(({ type }) => (
                <TypeBadge key={type.name} type={type.name} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Height</p>
                <p className="font-semibold">{formatHeight(pokemon.height)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="font-semibold">{formatWeight(pokemon.weight)}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Abilities</p>
              <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                {[...pokemon.abilities]
                  .sort((a, b) => a.slot - b.slot)
                  .map((entry) => (
                    <AbilityTooltip
                      key={entry.ability.name}
                      entry={entry}
                      className="text-sm text-foreground/90"
                    />
                  ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="glass-card min-w-0 rounded-2xl p-4 sm:p-6">
          <Tabs defaultValue="overview" className="min-w-0 w-full">
            <TabsList className="mb-6 flex h-auto w-full flex-wrap gap-1 bg-muted/50 p-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="moves">Moves</TabsTrigger>
              <TabsTrigger value="evolution">Evolution</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PokemonOverview pokemon={pokemon} species={species} />
              </motion.div>
            </TabsContent>

            <TabsContent value="stats" className="mt-0 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="grid min-w-0 gap-8 xl:grid-cols-2"
              >
                <StatsRadar stats={pokemon.stats} />
                <StatsBars stats={pokemon.stats} />
                <div className="min-w-0 xl:col-span-2">
                  <StatsRangeTable stats={pokemon.stats} />
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="moves" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MovesTable moves={pokemon.moves} />
              </motion.div>
            </TabsContent>

            <TabsContent value="evolution" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {evolution ? (
                  <EvolutionTree
                    chain={evolution.chain}
                    evolutionChainId={evolution.id}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This Pokémon does not evolve.
                  </p>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
