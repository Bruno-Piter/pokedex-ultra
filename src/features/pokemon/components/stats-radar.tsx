"use client";

import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { PokemonStat } from "@/features/pokemon/types";

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "Sp. ATK",
  "special-defense": "Sp. DEF",
  speed: "SPD",
};

type StatsRadarProps = {
  stats: PokemonStat[];
};

export function StatsRadar({ stats }: StatsRadarProps) {
  const data = stats.map((s) => ({
    stat: STAT_LABELS[s.stat.name] ?? s.stat.name,
    value: s.base_stat,
    fullMark: 255,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[280px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.35}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
