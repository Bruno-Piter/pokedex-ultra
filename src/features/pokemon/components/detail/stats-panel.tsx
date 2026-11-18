"use client";

import { motion } from "framer-motion";
import { useId, useState } from "react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { StatName } from "@/features/pokemon/types";
import type { PokemonSummary } from "@/features/pokemon/hooks/use-pokemon-detail";
import { PanelSection } from "@/features/pokemon/components/detail/panel-section";
import { StatsRadar } from "@/features/pokemon/components/detail/stats-radar";
import { getPokemonTypeColors } from "@/features/pokemon/utils/format";
import {
  calcStatRange,
  calcTotalStatRange,
  DISPLAY_LEVELS,
  formatStatRange,
  getStatValueColor,
  STAT_LABELS,
  STAT_ORDER,
} from "@/features/pokemon/utils/stats-calculator";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

function StatBars({ stats, bst }: { stats: Record<StatName, number>; bst: number }) {
  return (
    <div className="space-y-3">
      {STAT_ORDER.map((stat, index) => {
        const value = stats[stat] ?? 0;
        const color = getStatValueColor(value);
        return (
          <div key={stat} className="grid grid-cols-[4.75rem_2.5rem_minmax(0,1fr)] items-center gap-3">
            <span className="text-sm text-muted-foreground">{STAT_LABELS[stat]}</span>
            <AnimatedNumber
              value={value}
              from={0}
              duration={0.9}
              className="text-right font-mono text-sm font-bold tabular-nums"
            />
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 12px -2px ${color}` }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (value / 255) * 100)}%` }}
                transition={{ delay: 0.1 + index * 0.06, duration: 0.9, ease: EASE }}
              />
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-[4.75rem_2.5rem_minmax(0,1fr)] items-center gap-3 border-t border-border/60 pt-3">
        <span className="text-sm font-semibold">Total</span>
        <AnimatedNumber
          value={bst}
          from={0}
          duration={1.1}
          className="text-right font-mono text-sm font-black tabular-nums"
        />
        <span className="text-xs text-muted-foreground">
          {bst >= 600 ? "Elite tier" : bst >= 500 ? "Strong" : bst >= 400 ? "Average" : "Developing"}
        </span>
      </div>
    </div>
  );
}

function RangeCalculator({ stats }: { stats: Record<StatName, number> }) {
  const [level, setLevel] = useState<number>(50);
  const pillId = useId();
  const total = {
    hindering: calcTotalStatRange(stats, level, "hindering"),
    neutral: calcTotalStatRange(stats, level, "neutral"),
    beneficial: calcTotalStatRange(stats, level, "beneficial"),
  };

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Level" className="inline-grid grid-cols-4 gap-0.5 rounded-xl bg-muted/70 p-1">
        {DISPLAY_LEVELS.map((option) => {
          const active = option === level;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setLevel(option)}
              className={cn(
                "relative h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId={`level-pill-${pillId}`}
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                  className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
                />
              ) : null}
              <span className="relative">Lv. {option}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl ring-1 ring-border/60">
        <table className="w-full min-w-[22rem] text-sm">
          <thead>
            <tr className="bg-muted/60 text-left text-[11px] tracking-wide text-muted-foreground uppercase">
              <th className="sticky left-0 bg-muted px-3 py-2.5 font-semibold">Stat</th>
              <th className="px-3 py-2.5 text-center font-semibold">
                Nature <span className="text-destructive">−</span>
              </th>
              <th className="px-3 py-2.5 text-center font-semibold">Neutral</th>
              <th className="px-3 py-2.5 text-center font-semibold">
                Nature <span className="text-success">+</span>
              </th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {STAT_ORDER.map((stat) => {
              const base = stats[stat] ?? 0;
              const isHp = stat === "hp";
              return (
                <tr key={stat} className="border-t border-border/40">
                  <td className="sticky left-0 bg-card px-3 py-2 font-sans font-medium">
                    {STAT_LABELS[stat]}
                  </td>
                  {isHp ? (
                    <td colSpan={3} className="px-3 py-2 text-center">
                      {formatStatRange(calcStatRange(base, level, "neutral", true))}
                    </td>
                  ) : (
                    (["hindering", "neutral", "beneficial"] as const).map((nature) => (
                      <td
                        key={nature}
                        className={cn(
                          "px-3 py-2 text-center",
                          nature === "beneficial" && "text-success",
                          nature === "hindering" && "text-muted-foreground",
                        )}
                      >
                        {formatStatRange(calcStatRange(base, level, nature, false))}
                      </td>
                    ))
                  )}
                </tr>
              );
            })}
            <tr className="border-t border-border/60 bg-muted/30 font-semibold">
              <td className="sticky left-0 bg-muted px-3 py-2 font-sans">Total</td>
              <td className="px-3 py-2 text-center">{formatStatRange(total.hindering)}</td>
              <td className="px-3 py-2 text-center">{formatStatRange(total.neutral)}</td>
              <td className="px-3 py-2 text-center">{formatStatRange(total.beneficial)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Min: 0 IVs, 0 EVs · Max: 31 IVs, 252 EVs. HP isn&apos;t affected by nature.
      </p>
    </div>
  );
}

export function StatsPanel({ summary }: { summary: PokemonSummary }) {
  const colors = getPokemonTypeColors(summary.types);

  return (
    <div className="space-y-4">
      <PanelSection title="Base stats">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <StatBars stats={summary.stats} bst={summary.bst} />
          <StatsRadar stats={summary.stats} colors={colors} />
        </div>
      </PanelSection>
      <PanelSection title="Stat ranges" description="Possible stat values at a given level, by nature.">
        <RangeCalculator stats={summary.stats} />
      </PanelSection>
    </div>
  );
}
