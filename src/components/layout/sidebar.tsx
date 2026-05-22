"use client";

import { motion } from "framer-motion";
import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  GENERATION_RANGES,
  POKEMON_TYPES,
  getTypeColor,
} from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

export type FilterState = {
  type: string | null;
  sort: "id" | "name" | "weight" | "height";
  generation: number | null;
};

type SidebarProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
};

export function Sidebar({ filters, onChange }: SidebarProps) {
  const reset = () =>
    onChange({ type: null, sort: "id", generation: null });

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
            Filtros
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-1">
            <RotateCcw className="size-3" />
            Limpar
          </Button>
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Ordenar por
          </label>
          <Select
            value={filters.sort}
            onValueChange={(v) => {
              if (!v) return;
              onChange({ ...filters, sort: v as FilterState["sort"] });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Número (#)</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="weight">Peso</SelectItem>
              <SelectItem value="height">Altura</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Geração
          </label>
          <Select
            value={filters.generation?.toString() ?? "all"}
            onValueChange={(v) => {
              if (!v) return;
              onChange({
                ...filters,
                generation: v === "all" ? null : Number(v),
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {GENERATION_RANGES.map((g) => (
                <SelectItem key={g.gen} value={g.gen.toString()}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Tipo
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
              Todos
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
