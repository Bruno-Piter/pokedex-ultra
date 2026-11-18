"use client";

import { Drawer } from "@base-ui/react/drawer";
import { RotateCcw, X } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { resetCatalogFilters } from "@/features/pokemon/state/catalog-view-store";
import { countActiveFilters, type FilterState } from "@/features/pokemon/utils/catalog-filters";
import { FilterPanel } from "@/features/pokemon/components/filters/filter-panel";

type FilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  moveNames: string[];
  resultCount: number;
};

/** Mobile filters: a bottom sheet you can swipe down to close. */
export function FilterSheet({
  open,
  onOpenChange,
  filters,
  moveNames,
  resultCount,
}: FilterSheetProps) {
  const active = countActiveFilters(filters);

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-[80] bg-black/55 opacity-[calc(1-var(--drawer-swipe-progress,0))] backdrop-blur-[2px] transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 data-[swiping]:duration-0" />
        <Drawer.Viewport className="fixed inset-0 z-[90] flex items-end justify-center">
          <Drawer.Popup className="relative flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-[1.75rem] border border-b-0 border-border/70 bg-popover text-popover-foreground shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.6)] outline-none [transform:translateY(var(--drawer-swipe-movement-y,0px))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:[transform:translateY(100%)] data-[ending-style]:duration-[calc(var(--drawer-swipe-strength,1)*400ms)] data-[starting-style]:[transform:translateY(100%)] data-[swiping]:duration-0 data-[swiping]:select-none">
            <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden>
              <span className="h-1.5 w-11 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 px-5 pt-1 pb-3">
              <div>
                <Drawer.Title className="font-heading text-lg font-bold">Filters</Drawer.Title>
                <Drawer.Description className="text-xs text-muted-foreground">
                  {active === 0 ? "Showing everything" : `${active} active`}
                </Drawer.Description>
              </div>
              <Drawer.Close
                className="flex size-10 items-center justify-center rounded-full bg-muted/70 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </Drawer.Close>
            </div>

            <Drawer.Content className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border/50 px-5 pt-5 pb-6">
              <FilterPanel filters={filters} moveNames={moveNames} />
            </Drawer.Content>

            <div className="flex shrink-0 gap-2 border-t border-border/60 bg-popover/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => resetCatalogFilters()}
                disabled={active === 0}
                className="flex h-12 items-center gap-2 rounded-2xl border border-border/70 px-4 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-40"
              >
                <RotateCcw className="size-4" />
                Reset
              </button>
              <Drawer.Close className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-[0.98]">
                <span>
                  Show <AnimatedNumber value={resultCount} className="tabular-nums" />{" "}
                  {resultCount === 1 ? "result" : "results"}
                </span>
              </Drawer.Close>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
