"use client";

import { motion } from "framer-motion";
import type { PokemonStat } from "@/features/pokemon/types";
import {
  STAT_COLORS,
  STAT_LABELS,
} from "@/features/pokemon/utils/stats-calculator";

type StatsBarsProps = {
  stats: PokemonStat[];
};

export function StatsBars({ stats }: StatsBarsProps) {
  const total = stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <div className="space-y-4">
      {stats.map((stat, i) => {
        const name = stat.stat.name;
        const pct = Math.min((stat.base_stat / 255) * 100, 100);
        const color = STAT_COLORS[name as keyof typeof STAT_COLORS] ?? "#888";

        return (
          <div key={name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">
                {STAT_LABELS[name as keyof typeof STAT_LABELS] ?? name}
              </span>
              <span className="font-mono text-muted-foreground">
                {stat.base_stat}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
      <p className="pt-2 text-right text-sm text-muted-foreground">
        Total: <span className="font-mono font-semibold text-foreground">{total}</span>
      </p>
    </div>
  );
}
