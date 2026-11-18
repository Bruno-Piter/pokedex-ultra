"use client";

import { motion } from "framer-motion";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { useId } from "react";
import type { StatFilterStat } from "@/features/pokemon/types";
import type { FilterState, SortField } from "@/features/pokemon/utils/catalog-filters";
import {
  LIST_STAT_COLUMNS,
  STAT_COLORS,
  STAT_SHORT_LABELS,
} from "@/features/pokemon/utils/stats-calculator";
import { cn } from "@/lib/utils";

const SORT_FIELDS: { value: SortField; label: string }[] = [
  { value: "id", label: "No." },
  { value: "name", label: "Name" },
  { value: "height", label: "Height" },
  { value: "weight", label: "Weight" },
  { value: "stats", label: "Stats" },
];

type SortControlProps = {
  filters: FilterState;
  onChange: (next: Partial<FilterState>) => void;
};

export function SortControl({ filters, onChange }: SortControlProps) {
  const pillId = useId();
  const descending = filters.direction === "desc";
  const directionLabel =
    filters.sort === "name"
      ? descending
        ? "Z → A"
        : "A → Z"
      : descending
        ? "High → Low"
        : "Low → High";

  const toggleStat = (stat: StatFilterStat) => {
    const next = filters.sortStats.includes(stat)
      ? filters.sortStats.filter((s) => s !== stat)
      : [...filters.sortStats, stat];
    onChange({ sortStats: next });
  };

  return (
    <div className="space-y-2.5">
      <div
        role="radiogroup"
        aria-label="Sort by"
        className="grid grid-cols-5 gap-0.5 rounded-xl bg-muted/70 p-1"
      >
        {SORT_FIELDS.map((field) => {
          const active = filters.sort === field.value;
          return (
            <button
              key={field.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() =>
                onChange({
                  sort: field.value,
                  // Stats read best from the top performers down.
                  direction: field.value === "stats" && !active ? "desc" : filters.direction,
                })
              }
              className={cn(
                "relative h-9 rounded-lg text-xs font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={`sort-pill-${pillId}`}
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
                />
              ) : null}
              <span className="relative">{field.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange({ direction: descending ? "asc" : "desc" })}
        className="flex h-10 w-full items-center justify-between rounded-xl border border-border/70 bg-background/50 px-3 text-sm font-medium transition-colors hover:bg-muted/60"
        aria-label={`Order: ${directionLabel}. Click to reverse.`}
      >
        <span className="text-muted-foreground">Order</span>
        <span className="flex items-center gap-2">
          {directionLabel}
          <motion.span
            key={filters.direction}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
            className="flex text-primary"
          >
            {descending ? (
              <ArrowDownWideNarrow className="size-4" />
            ) : (
              <ArrowUpNarrowWide className="size-4" />
            )}
          </motion.span>
        </span>
      </button>

      {filters.sort === "stats" ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {LIST_STAT_COLUMNS.map((stat) => {
              const active = filters.sortStats.includes(stat);
              const color = STAT_COLORS[stat];
              return (
                <motion.button
                  key={stat}
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleStat(stat)}
                  aria-pressed={active}
                  className={cn(
                    "h-8 rounded-full border px-3 text-xs font-semibold transition-colors",
                    active
                      ? "border-transparent text-black"
                      : "border-border/70 text-muted-foreground hover:text-foreground",
                  )}
                  style={
                    active
                      ? { backgroundColor: color, boxShadow: `0 4px 14px -4px ${color}` }
                      : undefined
                  }
                >
                  {STAT_SHORT_LABELS[stat]}
                </motion.button>
              );
            })}
          </div>
          <p className="pt-2 text-[11px] text-muted-foreground">
            {filters.sortStats.length > 1
              ? "Sorting by the average of the selected stats."
              : filters.sortStats.length === 1
                ? "Pick more stats to sort by their average."
                : "No stat picked: sorting by base stat total (BST)."}
          </p>
        </motion.div>
      ) : null}
    </div>
  );
}
