"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChainLink, ExtendedChainLink } from "@/features/pokemon/types";
import { useExtendedEvolutionChain } from "@/features/pokemon/hooks/use-extended-evolution-chain";
import { formatPokemonId } from "@/features/pokemon/utils/format";
import { getEvolutionLabel } from "@/features/pokemon/utils/evolution-format";
import { getSpriteUrl } from "@/features/pokemon/utils/sprites";
import { cn } from "@/lib/utils";

type EvolutionTreeProps = {
  chain: ChainLink;
  evolutionChainId: number;
};

function EvolutionConnector({ label }: { label: string }) {
  return (
    <div className="flex min-w-[4.5rem] shrink-0 flex-col items-center justify-center px-1">
      {label && (
        <span className="mb-1 whitespace-nowrap text-center text-[11px] font-semibold text-muted-foreground">
          {label}
        </span>
      )}
      <ArrowRight className="size-5 text-muted-foreground/70" aria-hidden />
    </div>
  );
}

function EvolutionCell({ link }: { link: ExtendedChainLink }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        href={`/pokemon/${link.pokemonName}`}
        className={cn(
          "group flex h-36 w-[7.5rem] flex-col items-center justify-end gap-1 rounded-[2rem] px-2 pb-3 pt-4 transition-all",
          "bg-muted/50 hover:bg-muted hover:shadow-md hover:ring-2 hover:ring-primary/30",
          link.isFormBranch && "ring-1 ring-primary/20",
        )}
      >
        <div className="relative size-[4.5rem] shrink-0">
          <Image
            src={getSpriteUrl(link.pokemonId, "artwork")}
            alt={link.displayName}
            fill
            sizes="72px"
            className="object-contain transition-transform group-hover:scale-110"
          />
        </div>
        <span className="text-center text-xs font-bold leading-tight">
          {link.displayName}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatPokemonId(link.pokemonId)}
        </span>
      </Link>
    </motion.div>
  );
}

function getConnectorLabel(child: ExtendedChainLink): string {
  if (child.connectorLabel) return child.connectorLabel;
  return getEvolutionLabel(child.evolution_details);
}

function ChainSegment({ link }: { link: ExtendedChainLink }) {
  const naturalChildren = link.evolves_to.filter((child) => !child.isFormBranch);
  const formChildren = link.evolves_to.filter((child) => child.isFormBranch);

  if (naturalChildren.length === 0 && formChildren.length === 0) {
    return <EvolutionCell link={link} />;
  }

  if (naturalChildren.length === 1 && formChildren.length === 0) {
    const next = naturalChildren[0];
    return (
      <div className="flex items-center">
        <EvolutionCell link={link} />
        <EvolutionConnector label={getConnectorLabel(next)} />
        <ChainSegment link={next} />
      </div>
    );
  }

  if (naturalChildren.length === 1 && formChildren.length > 0) {
    const next = naturalChildren[0];
    return (
      <div className="flex items-center">
        <EvolutionCell link={link} />
        <div className="flex flex-col gap-6 py-2">
          <div className="flex items-center">
            <EvolutionConnector label={getConnectorLabel(next)} />
            <ChainSegment link={next} />
          </div>
          {formChildren.map((child) => (
            <div key={child.pokemonName} className="flex items-center">
              <EvolutionConnector label={getConnectorLabel(child)} />
              <EvolutionCell link={child} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <EvolutionCell link={link} />
      <div className="flex flex-col gap-6 py-2">
        {naturalChildren.map((child) => (
          <div key={child.pokemonName} className="flex items-center">
            <EvolutionConnector label={getConnectorLabel(child)} />
            <ChainSegment link={child} />
          </div>
        ))}
        {formChildren.map((child) => (
          <div key={child.pokemonName} className="flex items-center">
            <EvolutionConnector label={getConnectorLabel(child)} />
            <EvolutionCell link={child} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EvolutionTreeSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white dark:bg-emerald-800">
        Evolutionary Chain
      </div>
      <div className="flex gap-4 overflow-x-auto bg-muted/30 p-6 dark:bg-muted/10">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} className="h-36 w-[7.5rem] rounded-[2rem]" />
        ))}
      </div>
    </div>
  );
}

export function EvolutionTree({ chain, evolutionChainId }: EvolutionTreeProps) {
  const { data: extendedChain, isLoading } = useExtendedEvolutionChain(
    chain,
    evolutionChainId,
  );

  if (isLoading) {
    return <EvolutionTreeSkeleton />;
  }

  const displayChain = extendedChain ?? null;

  if (!displayChain) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div className="bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-white dark:bg-emerald-800">
        Evolutionary Chain
      </div>
      <div className="overflow-x-auto bg-muted/30 p-6 dark:bg-muted/10">
        <ChainSegment link={displayChain} />
      </div>
    </div>
  );
}
