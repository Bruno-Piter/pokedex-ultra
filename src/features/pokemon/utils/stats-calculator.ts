import type {
  NatureModifier,
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
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export const STAT_SHORT_LABELS: Record<StatFilterStat, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
  bst: "BST",
};

export const LIST_STAT_COLUMNS: StatFilterStat[] = [...STAT_ORDER, "bst"];

export const STAT_COLORS: Record<StatFilterStat, string> = {
  hp: "#FF5959",
  attack: "#F5AC78",
  defense: "#FAE078",
  "special-attack": "#9DB7F5",
  "special-defense": "#A7DB8D",
  speed: "#FA92B2",
  bst: "#A78BFA",
};

/** 0 (very low) … 5 (exceptional) for a base stat, or a BST when `isTotal`. */
export function getStatTier(value: number, isTotal = false): number {
  const v = isTotal ? value / 6 : value;
  if (v < 50) return 0;
  if (v < 70) return 1;
  if (v < 90) return 2;
  if (v < 110) return 3;
  if (v < 130) return 4;
  return 5;
}

/**
 * Color for a base stat value: red for very low, through orange/yellow/green
 * to cyan for exceptional values. Uses theme variables (--stat-tier-*) so the
 * light theme gets darker, readable shades.
 */
export function getStatValueColor(value: number, isTotal = false): string {
  return `var(--stat-tier-${getStatTier(value, isTotal)})`;
}

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
  const inner = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100);
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
  return `${range.min}–${range.max}`;
}

export function getBaseStatTotal(stats: Record<StatName, number>): number {
  return STAT_ORDER.reduce((sum, stat) => sum + (stats[stat] ?? 0), 0);
}

export function calcTotalStatRange(
  stats: Record<StatName, number>,
  level: number,
  natureModifier: NatureModifier,
): StatRange {
  return STAT_ORDER.reduce(
    (total, stat) => {
      const range = calcStatRange(stats[stat] ?? 0, level, natureModifier, stat === "hp");
      return { min: total.min + range.min, max: total.max + range.max };
    },
    { min: 0, max: 0 },
  );
}
