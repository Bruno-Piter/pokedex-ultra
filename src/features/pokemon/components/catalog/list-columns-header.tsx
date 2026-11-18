"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import type { StatFilterStat } from "@/features/pokemon/types";
import { setCatalogFilters } from "@/features/pokemon/state/catalog-view-store";
import type { FilterState, SortField } from "@/features/pokemon/utils/catalog-filters";
import {
  LIST_STAT_COLUMNS,
  STAT_COLORS,
  STAT_SHORT_LABELS,
} from "@/features/pokemon/utils/stats-calculator";
import { ROW_GRID } from "@/features/pokemon/components/catalog/row-layout";
import { cn } from "@/lib/utils";

function SortArrow({ direction }: { direction: "asc" | "desc" }) {
  const Icon = direction === "asc" ? ArrowUp : ArrowDown;
  return <Icon className="size-3 shrink-0" aria-hidden />;
}

/** Desktop column header: click a column to sort, click again to flip. */
export function ListColumnsHeader({ filters }: { filters: FilterState }) {
  const sortBy = (field: Exclude<SortField, "stats">) =>
    setCatalogFilters((current) => ({
      ...current,
      sort: field,
      sortStats: [],
      direction:
        current.sort === field ? (current.direction === "asc" ? "desc" : "asc") : "asc",
    }));

  const sortByStat = (stat: StatFilterStat) =>
    setCatalogFilters((current) => {
      const same =
        current.sort === "stats" &&
        current.sortStats.length === 1 &&
        current.sortStats[0] === stat;
      return {
        ...current,
        sort: "stats",
        sortStats: [stat],
        direction: same ? (current.direction === "asc" ? "desc" : "asc") : "desc",
      };
    });

  const headerButton =
    "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring outline-none";

  return (
    <div className="sticky top-[var(--header-h,4rem)] z-30 mb-2 hidden md:block">
      <div className="glass-card rounded-2xl px-4 py-2 shadow-sm">
        <div className={cn(ROW_GRID, "items-center gap-3")}>
          <button
            type="button"
            onClick={() => sortBy("id")}
            className={cn(headerButton, "justify-self-start text-muted-foreground")}
            aria-label="Sort by number"
          >
            #
            {filters.sort === "id" ? <SortArrow direction={filters.direction} /> : null}
          </button>
          <button
            type="button"
            onClick={() => sortBy("name")}
            className={cn(headerButton, "justify-self-start", filters.sort === "name" && "text-primary")}
          >
            Name
            {filters.sort === "name" ? <SortArrow direction={filters.direction} /> : null}
          </button>
          <span className="px-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Type
          </span>
          <span className="px-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Abilities
          </span>
          {LIST_STAT_COLUMNS.map((stat) => {
            const active =
              filters.sort === "stats" &&
              (filters.sortStats.includes(stat) || (filters.sortStats.length === 0 && stat === "bst"));
            return (
              <button
                key={stat}
                type="button"
                onClick={() => sortByStat(stat)}
                className={cn(
                  headerButton,
                  "justify-center justify-self-stretch",
                  active && "bg-muted ring-1 ring-inset ring-border",
                )}
                // Pastel stat colors are mixed toward the text color to stay
                // readable on both the dark and the light theme.
                style={{ color: `color-mix(in oklab, ${STAT_COLORS[stat]} 70%, var(--foreground))` }}
                title={`Sort by ${STAT_SHORT_LABELS[stat]}`}
              >
                {STAT_SHORT_LABELS[stat]}
                {active ? <SortArrow direction={filters.direction} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
