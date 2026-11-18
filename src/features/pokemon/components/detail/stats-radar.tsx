"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import type { StatName } from "@/features/pokemon/types";
import { STAT_SHORT_LABELS, getStatValueColor } from "@/features/pokemon/utils/stats-calculator";

/** Same layout as the games' summary screen, clockwise from the top. */
const AXES: StatName[] = ["hp", "attack", "defense", "speed", "special-defense", "special-attack"];

const SIZE = 280;
const CENTER = SIZE / 2;
const RADIUS = 92;

function point(index: number, ratio: number) {
  const angle = (-90 + index * 60) * (Math.PI / 180);
  return [CENTER + Math.cos(angle) * RADIUS * ratio, CENTER + Math.sin(angle) * RADIUS * ratio] as const;
}

function polygon(ratios: number[]) {
  return ratios.map((ratio, index) => point(index, ratio).join(",")).join(" ");
}

type StatsRadarProps = {
  stats: Record<StatName, number>;
  colors: [string, string];
};

export function StatsRadar({ stats, colors }: StatsRadarProps) {
  const gradientId = useId();
  const highest = Math.max(...AXES.map((stat) => stats[stat] ?? 0));
  // Scale to the Pokémon's best stat (min 150) so shapes stay readable.
  const max = Math.min(255, Math.max(150, Math.ceil(highest / 25) * 25));
  const ratios = AXES.map((stat) => Math.max(0.04, (stats[stat] ?? 0) / max));

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto w-full max-w-[20rem] overflow-visible"
      role="img"
      aria-label={`Stat chart: ${AXES.map((stat) => `${STAT_SHORT_LABELS[stat]} ${stats[stat]}`).join(", ")}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} stopOpacity={0.75} />
          <stop offset="100%" stopColor={colors[1]} stopOpacity={0.55} />
        </linearGradient>
      </defs>

      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon
          key={ring}
          points={polygon(AXES.map(() => ring))}
          fill="none"
          stroke="var(--border)"
          strokeWidth={ring === 1 ? 1.5 : 1}
        />
      ))}
      {AXES.map((stat, index) => {
        const [x, y] = point(index, 1);
        return <line key={stat} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="var(--border)" />;
      })}

      <motion.polygon
        points={polygon(ratios)}
        fill={`url(#${gradientId})`}
        stroke={colors[0]}
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 }}
      />

      {AXES.map((stat, index) => {
        const [x, y] = point(index, ratios[index]);
        return (
          <motion.circle
            key={stat}
            cx={x}
            cy={y}
            r={3.5}
            fill="var(--background)"
            stroke={colors[0]}
            strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 + index * 0.04 }}
          />
        );
      })}

      {AXES.map((stat, index) => {
        const [x, y] = point(index, 1.3);
        return (
          <text key={stat} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            <tspan x={x} dy="-0.45em" className="fill-muted-foreground text-[10px] font-semibold uppercase">
              {STAT_SHORT_LABELS[stat]}
            </tspan>
            <tspan
              x={x}
              dy="1.25em"
              className="text-[13px] font-bold"
              style={{ fill: getStatValueColor(stats[stat] ?? 0) }}
            >
              {stats[stat] ?? 0}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
