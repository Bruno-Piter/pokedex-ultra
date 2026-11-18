"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { MAX_TYPE_FILTERS } from "@/features/pokemon/utils/catalog-filters";
import {
  getTypeColor,
  getTypeTextColor,
  POKEMON_TYPES,
} from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

type TypeFilterProps = {
  value: string[];
  onChange: (types: string[]) => void;
};

export function TypeFilter({ value, onChange }: TypeFilterProps) {
  const full = value.length >= MAX_TYPE_FILTERS;

  const toggle = (type: string) => {
    if (value.includes(type)) onChange(value.filter((t) => t !== type));
    else if (!full) onChange([...value, type]);
  };

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {POKEMON_TYPES.map((type) => {
        const active = value.includes(type);
        const disabled = !active && full;
        const color = getTypeColor(type);
        return (
          <motion.button
            key={type}
            type="button"
            whileTap={disabled ? undefined : { scale: 0.9 }}
            whileHover={disabled ? undefined : { y: -1 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            onClick={() => toggle(type)}
            disabled={disabled}
            aria-pressed={active}
            className={cn(
              "relative flex h-9 items-center justify-center gap-1 rounded-xl border text-xs font-semibold capitalize transition-[background-color,border-color,opacity,box-shadow]",
              disabled && "cursor-not-allowed opacity-35",
            )}
            style={
              active
                ? {
                    backgroundColor: color,
                    borderColor: "transparent",
                    color: getTypeTextColor(type),
                    boxShadow: `0 6px 18px -6px ${color}`,
                  }
                : {
                    backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
                    borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
                  }
            }
          >
            {active ? <Check className="size-3" strokeWidth={3} /> : null}
            {type}
          </motion.button>
        );
      })}
    </div>
  );
}
