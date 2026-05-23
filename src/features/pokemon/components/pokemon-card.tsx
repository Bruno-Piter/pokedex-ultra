"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { TypeCardGlow } from "@/features/pokemon/components/type-card-glow";
import type { Pokemon } from "@/features/pokemon/types";
import {
  formatPokemonId,
  getPokemonTypeColors,
} from "@/features/pokemon/utils/format";
import { getOfficialArtwork } from "@/features/pokemon/utils/sprites";

type PokemonCardProps = {
  pokemon: Pokemon;
  index?: number;
};

export function PokemonCard({ pokemon, index = 0 }: PokemonCardProps) {
  const [primaryColor, secondaryColor] = getPokemonTypeColors(pokemon.types);
  const artwork = getOfficialArtwork(pokemon);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 24) * 0.03, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="h-full"
    >
      <Link href={`/pokemon/${pokemon.id}`} className="block h-full">
        <Card
          className="group relative h-full overflow-hidden border-border/50 bg-card/60 p-4 backdrop-blur-sm transition-shadow hover:shadow-xl"
          style={{
            boxShadow: `0 0 0 1px ${primaryColor}44, 0 8px 32px ${primaryColor}33, 0 8px 32px ${secondaryColor}33`,
          }}
        >
          <TypeCardGlow colors={[primaryColor, secondaryColor]} />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs text-muted-foreground">
                {formatPokemonId(pokemon.id)}
              </span>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[140px]">
              {artwork ? (
                <Image
                  src={artwork}
                  alt={pokemon.name}
                  fill
                  sizes="140px"
                  className="object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  ?
                </div>
              )}
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-heading text-base font-bold capitalize">
                {pokemon.name.replace(/-/g, " ")}
              </h3>
              <div className="flex flex-wrap justify-center gap-1">
                {pokemon.types.map(({ type }) => (
                  <TypeBadge key={type.name} type={type.name} />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
