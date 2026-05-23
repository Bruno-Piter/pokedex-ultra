"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Dna,
  Layers,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterSection } from "@/components/layout/filter-section";
import {
  countActiveFilters,
  hasActiveFilters,
  type FilterState,
} from "@/components/layout/filter-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  PokemonSortOption,
  StatFilterStat,
} from "@/features/pokemon/types";
import {
  STAT_COLORS,
  STAT_LABELS,
} from "@/features/pokemon/utils/stats-calculator";
import {
  GENERATION_RANGES,
  POKEMON_TYPES,
  getTypeColor,
} from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

export type { FilterState } from "@/components/layout/filter-utils";
export type { SortDirection } from "@/features/pokemon/types";

type SidebarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
};

const SORT_OPTIONS: { value: PokemonSortOption; label: string }[] = [
  { value: "id", label: "Number (#)" },
  { value: "name", label: "Name" },
  { value: "weight", label: "Weight" },
  { value: "height", label: "Height" },
];

const STAT_SORT_OPTIONS: { value: StatFilterStat; label: string }[] = [
  { value: "hp", label: STAT_LABELS.hp },
  { value: "attack", label: STAT_LABELS.attack },
  { value: "defense", label: STAT_LABELS.defense },
  { value: "special-attack", label: STAT_LABELS["special-attack"] },
  { value: "special-defense", label: STAT_LABELS["special-defense"] },
  { value: "speed", label: STAT_LABELS.speed },
  { value: "bst", label: "BST" },
];

const chipSpring = { type: "spring" as const, stiffness: 400, damping: 28 };

function getStatChipColor(stat: StatFilterStat): string | undefined {
  if (stat === "bst") return "#FF5959";
  return STAT_COLORS[stat];
}

export function Sidebar({ filters, onChange }: SidebarProps) {
  const activeTotal = countActiveFilters(filters);
  const filtersActive = hasActiveFilters(filters);

  const toggleType = (type: string) => {
    const selected = filters.types;
    if (selected.includes(type)) {
      onChange({ ...filters, types: selected.filter((t) => t !== type) });
      return;
    }
    if (selected.length >= 2) return;
    onChange({ ...filters, types: [...selected, type] });
  };

  const reset = () =>
    onChange({
      types: [],
      sort: "id",
      sortDirection: "asc",
      generation: null,
      statSort: [],
      search: "",
    });

  const toggleStatSort = (stat: StatFilterStat) => {
    const next = filters.statSort.includes(stat)
      ? filters.statSort.filter((s) => s !== stat)
      : [...filters.statSort, stat];
    onChange({ ...filters, statSort: next });
  };

  const sortSectionActive =
    (filters.sort !== "id" ? 1 : 0) + (filters.sortDirection !== "asc" ? 1 : 0);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="sticky top-20 z-30 w-full max-h-[calc(100vh-5.5rem)] shrink-0 self-start overflow-y-auto overscroll-contain lg:w-72"
    >
      <div className="filter-card-accent glass-card space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative size-8 shrink-0 overflow-hidden rounded-xl ring-1 ring-border/50">
              <Image
                src="/icon.png"
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Filtros</h2>
              <AnimatePresence mode="wait">
                {filtersActive ? (
                  <motion.p
                    key="active"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[10px] text-muted-foreground"
                  >
                    {activeTotal} filtro{activeTotal === 1 ? "" : "s"} ativo
                    {activeTotal === 1 ? "" : "s"}
                  </motion.p>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-[10px] text-muted-foreground"
                  >
                    Nenhum filtro aplicado
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            disabled={!filtersActive}
            className={cn(
              "h-8 gap-1 transition-colors",
              filtersActive &&
                "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
            )}
          >
            <RotateCcw className="size-3" />
            Clear
          </Button>
        </div>

        <FilterSection
          index={0}
          icon={<ArrowUpDown className="size-3.5" />}
          title="Sort by"
          activeCount={sortSectionActive}
        >
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <Select
                value={filters.sort}
                onValueChange={(v) => {
                  if (!v) return;
                  onChange({ ...filters, sort: v as PokemonSortOption });
                }}
              >
                <SelectTrigger className="w-full bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "shrink-0 transition-colors",
                filters.sortDirection === "desc" &&
                  "border-primary/40 bg-primary/15 ring-1 ring-primary/30",
              )}
              aria-label={
                filters.sortDirection === "asc"
                  ? "Ordenar do menor para o maior"
                  : "Ordenar do maior para o menor"
              }
              title={
                filters.sortDirection === "asc"
                  ? "Menor → maior"
                  : "Maior → menor"
              }
              onClick={() =>
                onChange({
                  ...filters,
                  sortDirection:
                    filters.sortDirection === "asc" ? "desc" : "asc",
                })
              }
            >
              {filters.sortDirection === "asc" ? (
                <ArrowUp className="size-4" />
              ) : (
                <ArrowDown className="size-4" />
              )}
            </Button>
          </div>
        </FilterSection>

        <FilterSection
          index={1}
          icon={<Layers className="size-3.5" />}
          title="Generation"
          activeCount={filters.generation ? 1 : 0}
        >
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              type="button"
              layout
              whileTap={{ scale: 0.92 }}
              transition={chipSpring}
              onClick={() => onChange({ ...filters, generation: null })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                !filters.generation
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted",
              )}
            >
              All
            </motion.button>
            {GENERATION_RANGES.map((g) => (
              <motion.button
                key={g.gen}
                type="button"
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={chipSpring}
                onClick={() =>
                  onChange({
                    ...filters,
                    generation: filters.generation === g.gen ? null : g.gen,
                  })
                }
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  filters.generation === g.gen
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                )}
                title={g.label}
              >
                {g.label.replace("Generation ", "Gen ")}
              </motion.button>
            ))}
          </div>
        </FilterSection>

        <FilterSection
          index={2}
          icon={<ArrowUpDown className="size-3.5" />}
          title="Sort by stats"
          hint="Clique para ordenar. Múltiplos stats = média dos valores selecionados."
          activeCount={filters.statSort.length}
        >
          <div className="flex flex-wrap gap-1.5">
            {STAT_SORT_OPTIONS.map((opt) => {
              const isActive = filters.statSort.includes(opt.value);
              const color = getStatChipColor(opt.value);

              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  layout
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  transition={chipSpring}
                  onClick={() => toggleStatSort(opt.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "text-white shadow-md"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: color,
                          boxShadow: `0 4px 14px ${color}55`,
                        }
                      : undefined
                  }
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection
          index={3}
          icon={<Dna className="size-3.5" />}
          title="Type"
          hint="Selecione até 2 tipos (Pokémon com todos os tipos escolhidos)."
          activeCount={filters.types.length}
        >
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              type="button"
              layout
              whileTap={{ scale: 0.92 }}
              transition={chipSpring}
              onClick={() => onChange({ ...filters, types: [] })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filters.types.length === 0
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted/80",
              )}
            >
              All
            </motion.button>
            {POKEMON_TYPES.map((type) => {
              const typeColor = getTypeColor(type);
              const isActive = filters.types.includes(type);
              const isDisabled =
                !isActive && filters.types.length >= 2;

              return (
                <motion.button
                  key={type}
                  type="button"
                  layout
                  whileHover={isDisabled ? undefined : { scale: 1.06 }}
                  whileTap={isDisabled ? undefined : { scale: 0.92 }}
                  transition={chipSpring}
                  disabled={isDisabled}
                  onClick={() => toggleType(type)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-all",
                    isActive
                      ? "border-transparent text-white shadow-lg"
                      : "text-muted-foreground hover:brightness-110",
                    isDisabled && "cursor-not-allowed opacity-40",
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: typeColor,
                          boxShadow: `0 4px 14px ${typeColor}55`,
                        }
                      : {
                          borderColor: `${typeColor}44`,
                          backgroundColor: `${typeColor}18`,
                        }
                  }
                >
                  {type}
                </motion.button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </motion.aside>
  );
}
