"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { resetCatalogFilters } from "@/features/pokemon/state/catalog-view-store";
import { countActiveFilters, type FilterState } from "@/features/pokemon/utils/catalog-filters";
import { FilterPanel } from "@/features/pokemon/components/filters/filter-panel";

type FilterSidebarProps = {
  filters: FilterState;
  moveNames: string[];
};

/** Desktop filters: sticky column next to the list. */
export function FilterSidebar({ filters, moveNames }: FilterSidebarProps) {
  const active = countActiveFilters(filters);

  return (
    <aside className="sticky top-[calc(var(--header-h,4rem)+1rem)] max-h-[calc(100dvh-var(--header-h,4rem)-2rem)] w-full overflow-hidden rounded-3xl glass-card shadow-lg">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <SlidersHorizontal className="size-4" />
          </span>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">Filters</h2>
            <p className="text-[11px] text-muted-foreground">
              {active === 0 ? "Showing everything" : `${active} active`}
            </p>
          </div>
        </div>
        <AnimatePresence>
          {active > 0 ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => resetCatalogFilters()}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>
      <div className="max-h-[calc(100dvh-var(--header-h,4rem)-6.5rem)] overflow-y-auto overscroll-contain px-5 py-5">
        <FilterPanel filters={filters} moveNames={moveNames} />
      </div>
    </aside>
  );
}
