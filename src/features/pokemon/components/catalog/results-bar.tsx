"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  resetCatalogFilters,
  setCatalogFilters,
} from "@/features/pokemon/state/catalog-view-store";
import {
  hasActiveFilters,
  isSortActive,
  type FilterState,
} from "@/features/pokemon/utils/catalog-filters";
import {
  GENERATION_RANGES,
  getTypeColor,
  titleCase,
} from "@/features/pokemon/utils/format";
import { STAT_SHORT_LABELS } from "@/features/pokemon/utils/stats-calculator";
import { cn } from "@/lib/utils";

const SORT_LABELS = {
  id: "Number",
  name: "Name",
  height: "Height",
  weight: "Weight",
  stats: "Stats",
} as const;

export function describeSort(filters: FilterState): string {
  if (filters.sort !== "stats") return SORT_LABELS[filters.sort];
  if (filters.sortStats.length === 0) return "BST";
  if (filters.sortStats.length === 1) return STAT_SHORT_LABELS[filters.sortStats[0]];
  return `Avg ${filters.sortStats.map((stat) => STAT_SHORT_LABELS[stat]).join(" + ")}`;
}

function Chip({
  children,
  onRemove,
  color,
  label,
}: {
  children: ReactNode;
  onRemove: () => void;
  color?: string;
  label: string;
}) {
  return (
    <motion.button
      layout
      type="button"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-card/80 pr-1.5 pl-3 text-xs font-medium shadow-sm transition-colors hover:border-destructive/50 hover:bg-destructive/10"
    >
      {color ? (
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      ) : null}
      {children}
      <span className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-destructive/15 group-hover:text-destructive">
        <X className="size-3" />
      </span>
    </motion.button>
  );
}

type ResultsBarProps = {
  count: number;
  total: number;
  filters: FilterState;
  moveLabel: (slug: string) => string;
  className?: string;
};

export function ResultsBar({ count, total, filters, moveLabel, className }: ResultsBarProps) {
  const active = hasActiveFilters(filters);
  const generation = GENERATION_RANGES.find((range) => range.gen === filters.generation);
  const search = filters.search.trim();
  const SortIcon = filters.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <div className={cn("mb-3 space-y-2.5", className)}>
      <div className="flex items-end justify-between gap-3 px-1">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <AnimatedNumber value={count} className="font-heading text-lg font-bold text-foreground tabular-nums" />{" "}
          {active ? (
            <>
              of <span className="tabular-nums">{total.toLocaleString("en-US")}</span> Pokémon
            </>
          ) : (
            "Pokémon"
          )}
        </p>
        <AnimatePresence>
          {active ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onClick={() => resetCatalogFilters({ includeSearch: true })}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              Clear all
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {active ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <motion.div layout className="flex flex-wrap gap-1.5 px-1 pb-1">
              <AnimatePresence mode="popLayout">
                {search ? (
                  <Chip key="search" label="search" onRemove={() => setCatalogFilters({ search: "" })}>
                    “{search}”
                  </Chip>
                ) : null}
                {filters.types.map((type) => (
                  <Chip
                    key={`type-${type}`}
                    label={type}
                    color={getTypeColor(type)}
                    onRemove={() =>
                      setCatalogFilters((f) => ({ ...f, types: f.types.filter((t) => t !== type) }))
                    }
                  >
                    <span className="capitalize">{type}</span>
                  </Chip>
                ))}
                {generation ? (
                  <Chip
                    key="generation"
                    label={generation.label}
                    onRemove={() => setCatalogFilters({ generation: null })}
                  >
                    Gen {generation.short} · {generation.region}
                  </Chip>
                ) : null}
                {filters.moves.map((move) => (
                  <Chip
                    key={`move-${move}`}
                    label={moveLabel(move)}
                    onRemove={() =>
                      setCatalogFilters((f) => ({ ...f, moves: f.moves.filter((m) => m !== move) }))
                    }
                  >
                    Knows {moveLabel(move) || titleCase(move)}
                  </Chip>
                ))}
                {!filters.showForms ? (
                  <Chip key="forms" label="forms hidden" onRemove={() => setCatalogFilters({ showForms: true })}>
                    Forms hidden
                  </Chip>
                ) : null}
                {isSortActive(filters) ? (
                  <Chip
                    key="sort"
                    label="sort"
                    onRemove={() =>
                      setCatalogFilters({ sort: "id", sortStats: [], direction: "asc" })
                    }
                  >
                    <SortIcon className="size-3" />
                    {describeSort(filters)}
                  </Chip>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
