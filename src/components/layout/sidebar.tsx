"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type {
  PokemonSortOption,
  SortDirection,
  StatFilterStat,
} from "@/features/pokemon/types";
import { STAT_LABELS } from "@/features/pokemon/utils/stats-calculator";
import {
  GENERATION_RANGES,
  POKEMON_TYPES,
  getTypeColor,
} from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

export type { SortDirection };

export type FilterState = {
  type: string | null;
  sort: PokemonSortOption;
  sortDirection: SortDirection;
  generation: number | null;
  statSort: StatFilterStat[];
  search: string;
};

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

export function Sidebar({ filters, onChange }: SidebarProps) {
  const reset = () =>
    onChange({
      type: null,
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

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full shrink-0 lg:w-64"
    >
      <div className="glass-card sticky top-20 space-y-5 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="size-4" />
            Filters
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-1">
            <RotateCcw className="size-3" />
            Clear
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Sort by
          </label>
          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <Select
                value={filters.sort}
                onValueChange={(v) => {
                  if (!v) return;
                  onChange({ ...filters, sort: v as PokemonSortOption });
                }}
              >
                <SelectTrigger className="w-full">
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
              className="shrink-0"
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
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Generation
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...filters, generation: null })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                !filters.generation
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              All
            </button>
            {GENERATION_RANGES.map((g) => (
              <motion.button
                key={g.gen}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  onChange({
                    ...filters,
                    generation: filters.generation === g.gen ? null : g.gen,
                  })
                }
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
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
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Sort by stats
          </label>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Clique para ordenar. Múltiplos stats = ordena pela média dos valores selecionados.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STAT_SORT_OPTIONS.map((opt) => {
              const isActive = filters.statSort.includes(opt.value);

              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleStatSort(opt.value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {opt.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: null })}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                !filters.type
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              All
            </button>
            {POKEMON_TYPES.map((type) => (
              <motion.button
                key={type}
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  onChange({
                    ...filters,
                    type: filters.type === type ? null : type,
                  })
                }
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium capitalize transition-all",
                  filters.type === type
                    ? "text-white shadow-lg"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted",
                )}
                style={
                  filters.type === type
                    ? {
                        backgroundColor: getTypeColor(type),
                        boxShadow: `0 4px 14px ${getTypeColor(type)}55`,
                      }
                    : undefined
                }
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
