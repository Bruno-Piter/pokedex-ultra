"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { Catalog, FormKind } from "@/lib/data/catalog";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpeciesDetail } from "@/features/pokemon/api/pokemon.api";
import { useMovesIndex } from "@/features/pokemon/hooks/use-catalog";
import { useEvolutionChain } from "@/features/pokemon/hooks/use-pokemon-detail";
import { PokemonArtwork } from "@/features/pokemon/components/pokemon-artwork";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { PanelSection } from "@/features/pokemon/components/detail/panel-section";
import {
  buildEvolutionTree,
  type EvolutionForm,
  type EvolutionNode,
} from "@/features/pokemon/utils/evolution-chain";
import { formatDexNumber, getPokemonTypeColors } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

const FORM_GROUP_TITLES: Record<FormKind, string> = {
  mega: "Mega Evolutions",
  gmax: "Gigantamax",
  primal: "Primal Reversion",
  regional: "Regional forms",
  other: "Other forms",
};

function EvolutionCard({
  node,
  catalog,
  current,
  index,
}: {
  node: { pokemonId: number; displayName: string; speciesId: number; isBaby?: boolean };
  catalog: Catalog;
  current: boolean;
  index: number;
}) {
  const entry = catalog.byId.get(node.pokemonId);
  const [t1, t2] = getPokemonTypeColors(entry?.types ?? ["normal"]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        href={`/pokemon/${node.pokemonId}`}
        transitionTypes={["nav-forward"]}
        aria-current={current ? "page" : undefined}
        className={cn(
          "type-card group relative flex w-[8.5rem] flex-col items-center rounded-3xl px-3 pt-3 pb-3.5 text-center outline-none focus-visible:outline-3 focus-visible:outline-ring",
          // .type-card owns box-shadow, so highlight with an outline instead of a ring.
          current && "outline-2 outline-offset-4 outline-primary",
        )}
        style={{ "--t1": t1, "--t2": t2 } as React.CSSProperties}
      >
        <span className="relative size-20 transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-110">
          <PokemonArtwork id={node.pokemonId} alt="" flags={entry?.sprites} sizes="80px" />
        </span>
        <span className="mt-1.5 font-mono text-[10px] text-muted-foreground tabular-nums">
          {formatDexNumber(node.speciesId)}
        </span>
        <span className="line-clamp-2 text-sm leading-tight font-bold">{node.displayName}</span>
        {entry ? (
          <span className="mt-1.5 flex flex-wrap justify-center gap-1">
            {entry.types.map((type) => (
              <TypeBadge key={type} type={type} size="sm" className="h-4 px-1.5 text-[9px]" />
            ))}
          </span>
        ) : null}
        {node.isBaby ? (
          <span className="mt-1 text-[10px] font-semibold text-muted-foreground uppercase">Baby</span>
        ) : null}
        {current ? (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold tracking-wider text-primary-foreground uppercase shadow-md">
            Viewing
          </span>
        ) : null}
      </Link>
    </motion.div>
  );
}

function Connector({ node, vertical }: { node: EvolutionNode; vertical: boolean }) {
  const label = node.conditions.join(" or ") || "Evolves";
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center gap-1.5 px-2 py-2 text-center",
        !vertical && "md:w-40 md:py-0",
      )}
    >
      <ArrowDown className={cn("size-4 text-muted-foreground", !vertical && "md:hidden")} />
      <span className="max-w-[12rem] rounded-xl bg-primary/12 px-2.5 py-1 text-[11px] leading-snug font-semibold text-primary">
        {label}
      </span>
      {node.fromForm ? (
        <span className="text-[10px] text-muted-foreground">from {node.fromForm}</span>
      ) : null}
      {node.alternatives.length > 0 ? (
        <span className="max-w-[12rem] text-[10px] leading-snug text-muted-foreground">
          Older games: {node.alternatives.slice(0, 2).join("; ")}
        </span>
      ) : null}
      {vertical ? null : <ArrowRight className="hidden size-4 text-muted-foreground md:block" />}
    </div>
  );
}

/** Whether any stage of the chain splits into several evolutions. */
function hasBranching(node: EvolutionNode): boolean {
  return node.children.length > 1 || node.children.some(hasBranching);
}

/** Max columns for a branching stage, based on how many branches it has. */
function branchGridClass(count: number): string {
  if (count >= 4) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  if (count === 3) return "grid-cols-2 sm:grid-cols-3";
  return "grid-cols-2";
}

/**
 * Linear chains read left → right on wide screens; once a stage branches
 * (Eevee, Tyrogue, Wurmple…) it and everything below stack top → bottom,
 * so the root stays in view.
 */
function Branch({
  node,
  catalog,
  currentId,
  depth,
  vertical = false,
}: {
  node: EvolutionNode;
  catalog: Catalog;
  currentId: number;
  depth: number;
  vertical?: boolean;
}) {
  const branching = node.children.length > 1;
  const stacked = vertical || branching;

  return (
    <div className={cn("flex flex-col items-center", !stacked && "md:flex-row")}>
      <EvolutionCard node={node} catalog={catalog} current={node.pokemonId === currentId} index={depth} />
      {node.children.length > 0 ? (
        <div
          className={cn(
            branching
              ? cn("mt-1 grid w-full justify-items-center gap-x-3 gap-y-5", branchGridClass(node.children.length))
              : cn("flex flex-col items-center", !stacked && "md:flex-row"),
          )}
        >
          {node.children.map((child) => (
            <div key={child.key} className={cn("flex flex-col items-center", !stacked && "md:flex-row")}>
              <Connector node={child} vertical={stacked} />
              <Branch
                node={child}
                catalog={catalog}
                currentId={currentId}
                depth={depth + 1}
                vertical={stacked}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FormGroups({ forms, catalog, currentId }: { forms: EvolutionForm[]; catalog: Catalog; currentId: number }) {
  const groups = forms.reduce<Partial<Record<FormKind, EvolutionForm[]>>>((acc, form) => {
    (acc[form.kind] ??= []).push(form);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {(Object.keys(FORM_GROUP_TITLES) as FormKind[]).map((kind) => {
        const items = groups[kind];
        if (!items?.length) return null;
        return (
          <div key={kind} className="space-y-2.5">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {FORM_GROUP_TITLES[kind]} <span className="opacity-70">({items.length})</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
              {items.map((form, index) => (
                <EvolutionCard
                  key={form.pokemonId}
                  node={form}
                  catalog={catalog}
                  current={form.pokemonId === currentId}
                  index={index}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EvolutionSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex flex-col items-center gap-4 md:flex-row">
          {index > 0 ? <Skeleton className="h-6 w-24 rounded-xl" /> : null}
          <Skeleton className="h-44 w-[8.5rem] rounded-3xl" />
        </div>
      ))}
    </div>
  );
}

type EvolutionPanelProps = {
  currentId: number;
  displayName: string;
  catalog: UseQueryResult<Catalog>;
  species: UseQueryResult<SpeciesDetail>;
};

export function EvolutionPanel({ currentId, displayName, catalog, species }: EvolutionPanelProps) {
  const chainId = species.data?.evolutionChainId;
  const chain = useEvolutionChain(chainId);
  const movesIndex = useMovesIndex();

  const tree = useMemo(() => {
    if (!chain.data || !catalog.data) return null;
    const moves = movesIndex.data?.moves;
    return buildEvolutionTree(chain.data.chain, catalog.data, {
      move: moves ? (slug) => moves.get(slug)?.label ?? slug : undefined,
    });
  }, [chain.data, catalog.data, movesIndex.data]);

  const failed = species.isError || chain.isError || catalog.isError;
  if (failed) {
    return (
      <ErrorState
        title="Couldn't load the evolution chain"
        onRetry={() => {
          if (species.isError) void species.refetch();
          if (chain.isError) void chain.refetch();
          if (catalog.isError) void catalog.refetch();
        }}
        retrying={species.isFetching || chain.isFetching || catalog.isFetching}
      />
    );
  }

  if (species.data && chainId === null) {
    return <EmptyState title={`${displayName} does not evolve`} />;
  }

  if (!tree || !catalog.data) {
    return (
      <PanelSection title="Evolution chain">
        <EvolutionSkeleton />
      </PanelSection>
    );
  }

  return (
    <div className="space-y-4">
      <PanelSection
        title="Evolution chain"
        description={tree.nodeCount === 1 ? `${displayName} does not evolve.` : "Tap a Pokémon to open it."}
      >
        <div className="flex justify-center overflow-x-auto pb-2 md:justify-start">
          <div className="w-full md:mx-auto md:w-auto">
            <Branch
              node={tree.root}
              catalog={catalog.data}
              currentId={currentId}
              depth={0}
              vertical={hasBranching(tree.root)}
            />
          </div>
        </div>
      </PanelSection>

      {tree.forms.length > 0 ? (
        <PanelSection title="Forms" description="Mega Evolutions, Gigantamax and other variants.">
          <FormGroups forms={tree.forms} catalog={catalog.data} currentId={currentId} />
        </PanelSection>
      ) : null}
    </div>
  );
}
