"use client";

import { motion } from "framer-motion";
import { GENERATION_RANGES } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

type GenerationFilterProps = {
  value: number | null;
  onChange: (generation: number | null) => void;
};

export function GenerationFilter({ value, onChange }: GenerationFilterProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {GENERATION_RANGES.map((range) => {
        const active = value === range.gen;
        return (
          <motion.button
            key={range.gen}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(active ? null : range.gen)}
            aria-pressed={active}
            title={range.label}
            className={cn(
              "flex h-12 flex-col items-center justify-center rounded-xl border text-xs transition-colors",
              active
                ? "border-primary/50 bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "border-border/70 bg-background/40 hover:border-border hover:bg-muted/60",
            )}
          >
            <span className="font-bold">Gen {range.short}</span>
            <span
              className={cn(
                "text-[10px]",
                active ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {range.region}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
