import type {
  NatureModifier,
  PokemonStat,
  StatFilterStat,
  StatName,
  StatRange,
} from "@/features/pokemon/types";

export const STAT_ORDER: StatName[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

export const STAT_LABELS: Record<StatName, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Attack",
  "special-defense": "Sp. Defense",
  speed: "Speed",
};

export const STAT_SHORT_LABELS: Record<StatName, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

export const LIST_STAT_COLUMNS: (StatName | "bst")[] = [...STAT_ORDER, "bst"];

export const LIST_STAT_LABELS: Record<StatName | "bst", string> = {
  ...STAT_SHORT_LABELS,
  bst: "BST",
};

export function isStatColumnHighlighted(
  stat: StatName | "bst",
  statSort: StatFilterStat[],
): boolean {
  return statSort.includes(stat);
}

export const STAT_COLORS: Record<StatName, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
};

export const DISPLAY_LEVELS = [50, 100, 150, 200] as const;

const NATURE_MULTIPLIERS: Record<NatureModifier, number> = {
  hindering: 0.9,
  neutral: 1.0,
  beneficial: 1.1,
};

const MIN_IV = 0;
const MAX_IV = 31;
const MAX_EV = 252;

function calcStat(
  base: number,
  level: number,
  iv: number,
  ev: number,
  natureMultiplier: number,
  isHp: boolean,
): number {
  const inner = Math.floor(
    ((2 * base + iv + Math.floor(ev / 4)) * level) / 100,
  );
  if (isHp) return inner + level + 10;
  return Math.floor((inner + 5) * natureMultiplier);
}

export function calcStatRange(
  base: number,
  level: number,
  natureModifier: NatureModifier,
  isHp: boolean,
): StatRange {
  const multiplier = isHp ? 1 : NATURE_MULTIPLIERS[natureModifier];
  return {
    min: calcStat(base, level, MIN_IV, 0, multiplier, isHp),
    max: calcStat(base, level, MAX_IV, MAX_EV, multiplier, isHp),
  };
}

export function formatStatRange(range: StatRange): string {
  return `${range.min} - ${range.max}`;
}

export function getBaseStatMap(stats: PokemonStat[]): Record<StatName, number> {
  const map = {} as Record<StatName, number>;
  for (const stat of stats) {
    map[stat.stat.name as StatName] = stat.base_stat;
  }
  return map;
}

export function getBaseStatTotal(stats: PokemonStat[]): number {
  return stats.reduce((sum, s) => sum + s.base_stat, 0);
}

export function calcTotalStatRange(
  baseMap: Record<StatName, number>,
  level: number,
  natureModifier: NatureModifier,
): StatRange {
  return STAT_ORDER.reduce(
    (total, stat) => {
      const range = calcStatRange(
        baseMap[stat] ?? 0,
        level,
        natureModifier,
        stat === "hp",
      );
      return { min: total.min + range.min, max: total.max + range.max };
    },
    { min: 0, max: 0 },
  );
}
