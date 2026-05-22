"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ChainLink } from "@/features/pokemon/types";
import { formatPokemonId } from "@/features/pokemon/utils/format";
import { getSpriteUrl } from "@/features/pokemon/utils/sprites";
import { extractIdFromUrl } from "@/lib/pokeapi/client";

type EvolutionTreeProps = {
  chain: ChainLink;
};

function EvolutionNode({ link, depth = 0 }: { link: ChainLink; depth?: number }) {
  const id = extractIdFromUrl(link.species.url);
  const name = link.species.name;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: depth * 0.15 }}
      >
        <Link
          href={`/pokemon/${id}`}
          className="group flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-muted/50"
        >
          <div className="relative size-24">
            <Image
              src={getSpriteUrl(id, "artwork")}
              alt={name}
              fill
              sizes="96px"
              className="object-contain transition-transform group-hover:scale-110"
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {formatPokemonId(id)}
          </span>
          <span className="text-sm font-semibold capitalize">
            {name.replace(/-/g, " ")}
          </span>
          {link.evolution_details[0]?.min_level && depth > 0 && (
            <span className="text-xs text-muted-foreground">
              Nv. {link.evolution_details[0].min_level}
            </span>
          )}
        </Link>
      </motion.div>

      {link.evolves_to.length > 0 && (
        <div className="flex flex-wrap items-start justify-center gap-6 border-t border-dashed border-border/50 pt-4">
          {link.evolves_to.map((next) => (
            <div key={next.species.name} className="relative flex items-center">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute -left-4 hidden h-px w-4 bg-border sm:block"
              />
              <EvolutionNode link={next} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvolutionTree({ chain }: EvolutionTreeProps) {
  return (
    <div className="overflow-x-auto py-4">
      <EvolutionNode link={chain} />
    </div>
  );
}
