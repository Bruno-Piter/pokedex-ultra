"use client";

import { Switch } from "@base-ui/react/switch";
import { ArrowUpDown, Dna, Layers, Shapes, Swords } from "lucide-react";
import { FilterSection } from "@/components/layout/filter-section";
import { setCatalogFilters } from "@/features/pokemon/state/catalog-view-store";
import { isSortActive, type FilterState } from "@/features/pokemon/utils/catalog-filters";
import { GenerationFilter } from "@/features/pokemon/components/filters/generation-filter";
import { MoveCombobox } from "@/features/pokemon/components/filters/move-combobox";
import { SortControl } from "@/features/pokemon/components/filters/sort-control";
import { TypeFilter } from "@/features/pokemon/components/filters/type-filter";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  filters: FilterState;
  moveNames: string[];
  className?: string;
};

/** Filter controls shared by the desktop sidebar and the mobile bottom sheet. */
export function FilterPanel({ filters, moveNames, className }: FilterPanelProps) {
  const update = (next: Partial<FilterState>) => setCatalogFilters(next);

  return (
    <div className={cn("space-y-6", className)}>
      <FilterSection
        icon={<ArrowUpDown className="size-3.5" />}
        title="Sort"
        activeCount={isSortActive(filters) ? 1 : 0}
      >
        <SortControl filters={filters} onChange={update} />
      </FilterSection>

      <FilterSection
        icon={<Dna className="size-3.5" />}
        title="Type"
        hint="Pick up to 2 — Pokémon must have both."
        activeCount={filters.types.length}
      >
        <TypeFilter value={filters.types} onChange={(types) => update({ types })} />
      </FilterSection>

      <FilterSection
        icon={<Layers className="size-3.5" />}
        title="Generation"
        activeCount={filters.generation ? 1 : 0}
      >
        <GenerationFilter
          value={filters.generation}
          onChange={(generation) => update({ generation })}
        />
      </FilterSection>

      <FilterSection
        icon={<Swords className="size-3.5" />}
        title="Moves"
        hint="Pokémon that can learn every selected move (up to 4)."
        activeCount={filters.moves.length}
      >
        <MoveCombobox
          moveNames={moveNames}
          value={filters.moves}
          onChange={(moves) => update({ moves })}
        />
      </FilterSection>

      <FilterSection
        icon={<Shapes className="size-3.5" />}
        title="Forms"
        activeCount={filters.showForms ? 0 : 1}
      >
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2.5">
          <span className="text-sm">
            Show alternate forms
            <span className="block text-[11px] text-muted-foreground">
              Megas, Gigantamax, regional forms…
            </span>
          </span>
          <Switch.Root
            checked={filters.showForms}
            onCheckedChange={(showForms) => update({ showForms })}
            className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-muted p-0.5 ring-1 ring-border/60 transition-colors data-[checked]:bg-primary"
          >
            <Switch.Thumb className="size-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-[var(--ease-spring)] data-[checked]:translate-x-5" />
          </Switch.Root>
        </label>
      </FilterSection>
    </div>
  );
}
