"use client";

import { Fragment } from "react";
import type { PokemonStat } from "@/features/pokemon/types";
import {
  DISPLAY_LEVELS,
  STAT_COLORS,
  STAT_LABELS,
  STAT_ORDER,
  calcStatRange,
  formatStatRange,
  getBaseStatMap,
  getBaseStatTotal,
} from "@/features/pokemon/utils/stats-calculator";
import type { NatureModifier } from "@/features/pokemon/types";

const NATURE_ROWS: { modifier: NatureModifier; label: string }[] = [
  { modifier: "hindering", label: "Max Stats — Hindering Nature" },
  { modifier: "neutral", label: "Max Stats — Neutral Nature" },
  { modifier: "beneficial", label: "Max Stats — Beneficial Nature" },
];

type StatsRangeTableProps = {
  stats: PokemonStat[];
};

export function StatsRangeTable({ stats }: StatsRangeTableProps) {
  const baseMap = getBaseStatMap(stats);
  const total = getBaseStatTotal(stats);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Stat Ranges (Min – Max)</h3>
      <p className="text-xs text-muted-foreground">
        IV 0–31, EV 252, por natureza (estilo Serebii)
      </p>

      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/80">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">Stat</th>
              {STAT_ORDER.map((stat) => (
                <th
                  key={stat}
                  className="px-3 py-2.5 font-medium"
                  style={{ color: STAT_COLORS[stat] }}
                >
                  {STAT_LABELS[stat]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border/30 bg-muted/20">
              <td className="px-3 py-2.5 font-medium">
                Base Stats
                <span className="ml-1 font-mono text-xs text-muted-foreground">
                  (Total: {total})
                </span>
              </td>
              {STAT_ORDER.map((stat) => (
                <td key={stat} className="px-3 py-2.5 font-mono">
                  {baseMap[stat] ?? "—"}
                </td>
              ))}
            </tr>

            {NATURE_ROWS.map(({ modifier, label }) => (
              <Fragment key={modifier}>
                {DISPLAY_LEVELS.map((level, levelIndex) => (
                  <tr
                    key={`${modifier}-${level}`}
                    className="border-t border-border/30 hover:bg-muted/20"
                  >
                    <td className="px-3 py-2 align-top text-xs">
                      {levelIndex === 0 && (
                        <span className="font-medium text-foreground">
                          {label}
                        </span>
                      )}
                      <div className="mt-0.5 font-mono text-muted-foreground">
                        Lv. {level}
                      </div>
                    </td>
                    {STAT_ORDER.map((stat) => {
                      const base = baseMap[stat] ?? 0;
                      const range = calcStatRange(
                        base,
                        level,
                        modifier,
                        stat === "hp",
                      );
                      return (
                        <td
                          key={stat}
                          className="px-3 py-2 font-mono text-xs sm:text-sm"
                        >
                          {formatStatRange(range)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
