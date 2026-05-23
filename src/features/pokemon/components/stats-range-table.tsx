"use client";

import type { PokemonStat } from "@/features/pokemon/types";
import {
  DISPLAY_LEVELS,
  STAT_COLORS,
  STAT_LABELS,
  STAT_ORDER,
  calcStatRange,
  calcTotalStatRange,
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

      <div className="overflow-x-auto rounded-xl border border-border/50 sm:overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-muted/80">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-2 py-2.5 font-medium sm:px-3">Stat</th>
              {STAT_ORDER.map((stat) => (
                <th
                  key={stat}
                  className="px-2 py-2.5 font-medium sm:px-3"
                  style={{ color: STAT_COLORS[stat] }}
                >
                  {STAT_LABELS[stat]}
                </th>
              ))}
              <th className="px-2 py-2.5 font-medium sm:px-3">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border/30 bg-muted/20">
              <td className="px-2 py-2.5 font-medium sm:px-3">Base Stats</td>
              {STAT_ORDER.map((stat) => (
                <td key={stat} className="px-2 py-2.5 font-mono sm:px-3">
                  {baseMap[stat] ?? "—"}
                </td>
              ))}
              <td className="px-2 py-2.5 font-mono font-semibold sm:px-3">
                {total}
              </td>
            </tr>
          </tbody>

          {NATURE_ROWS.map(({ modifier, label }) => (
            <tbody
              key={modifier}
              className="border-t-2 border-border/60 bg-muted/10"
            >
              <tr className="bg-muted/35">
                <td
                  colSpan={STAT_ORDER.length + 2}
                  className="px-2 py-2.5 text-xs font-semibold tracking-wide text-foreground sm:px-3"
                >
                  {label}
                </td>
              </tr>
              {DISPLAY_LEVELS.map((level) => (
                <tr
                  key={`${modifier}-${level}`}
                  className="border-t border-border/25 hover:bg-muted/25"
                >
                  <td className="px-2 py-2.5 pl-4 font-mono text-xs text-muted-foreground sm:px-3 sm:pl-5">
                    Lv. {level}
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
                        className="px-2 py-2.5 font-mono text-xs sm:px-3 sm:text-sm"
                      >
                        {formatStatRange(range)}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2.5 font-mono text-xs font-semibold sm:px-3 sm:text-sm">
                    {formatStatRange(
                      calcTotalStatRange(baseMap, level, modifier),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
