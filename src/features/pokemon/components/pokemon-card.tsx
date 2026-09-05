"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { TypeCardGlow } from "@/features/pokemon/components/type-card-glow";
import { POKEMON_LIST_ROW_CLASS } from "@/features/pokemon/components/pokemon-list-row-layout";
import { AbilityTooltip } from "@/features/pokemon/components/ability-tooltip";
import { PokemonSpriteImage } from "@/features/pokemon/components/pokemon-sprite-image";
import type { Pokemon, StatFilterStat } from "@/features/pokemon/types";
import {
  formatPokemonId,
  getPokemonStatValue,
  getPokemonTypeColors,
} from "@/features/pokemon/utils/format";
import {
  getBaseStatMap,
  isStatColumnHighlighted,
  LIST_STAT_COLUMNS,
} from "@/features/pokemon/utils/stats-calculator";
import { cn } from "@/lib/utils";

type PokemonCardProps = {
  pokemon: Pokemon;
  index?: number;
  statSort?: StatFilterStat[];
};

export function PokemonCard({ pokemon, index = 0, statSort = [] }: PokemonCardProps) {
  const [primaryColor, secondaryColor] = getPokemonTypeColors(pokemon.types);
  const statMap = getBaseStatMap(pokemon.stats);
  const abilities = [...pokemon.abilities].sort((a, b) => a.slot - b.slot);
  const displayName = pokemon.name.replace(/-/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 24) * 0.02, duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      <Link href={`/pokemon/${pokemon.id}`} className="block">
        <Card
          className="group relative overflow-hidden border-border/50 bg-card/60 py-3 backdrop-blur-sm transition-shadow hover:shadow-xl"
          style={{
            boxShadow: `0 0 0 1px ${primaryColor}44, 0 8px 32px ${primaryColor}33, 0 8px 32px ${secondaryColor}33`,
          }}
        >
          <TypeCardGlow colors={[primaryColor, secondaryColor]} />

          <div className="relative z-10 px-3 sm:px-4">
            {/* Mobile / narrow: compact card — sprite + id/name + types */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="relative size-14 shrink-0 sm:size-16">
                <PokemonSpriteImage
                  pokemon={pokemon}
                  alt={pokemon.name}
                  fill
                  sizes="64px"
                  className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-muted-foreground">
                  {formatPokemonId(pokemon.id)}
                </p>
                <h3 className="font-heading truncate text-base font-bold capitalize leading-tight">
                  {displayName}
                </h3>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                {pokemon.types.map(({ type }) => (
                  <TypeBadge key={type.name} type={type.name} />
                ))}
              </div>
            </div>

            {/* Desktop / md+: full stats table row */}
            <div className={cn(POKEMON_LIST_ROW_CLASS, "hidden md:grid")}>
              <div className="relative size-[72px] shrink-0">
                <PokemonSpriteImage
                  pokemon={pokemon}
                  alt={pokemon.name}
                  fill
                  sizes="72px"
                  className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">
                  {formatPokemonId(pokemon.id)}
                </p>
                <h3 className="font-heading truncate text-base font-bold capitalize">
                  {displayName}
                </h3>
              </div>

              <div className="flex flex-col gap-1">
                {pokemon.types.map(({ type }) => (
                  <TypeBadge key={type.name} type={type.name} />
                ))}
              </div>

              <div className="min-w-0 space-y-0.5 text-sm">
                {abilities.map((entry) => (
                  <AbilityTooltip
                    key={entry.ability.name}
                    entry={entry}
                    className="text-foreground/90"
                  />
                ))}
              </div>

              {LIST_STAT_COLUMNS.map((stat) => (
                <p
                  key={stat}
                  className={cn(
                    "min-w-0 text-center font-mono text-xs tabular-nums sm:text-sm",
                    isStatColumnHighlighted(stat, statSort) &&
                      "font-semibold text-destructive",
                  )}
                >
                  {stat === "bst"
                    ? getPokemonStatValue(pokemon, "bst")
                    : (statMap[stat] ?? "—")}
                </p>
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}