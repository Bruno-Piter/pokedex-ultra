import {
  formatMoveEffect,
  getMoveStatsInGame,
  type DamageClass,
  type MoveInfo,
  type MovesIndex,
  type MoveStatsInGame,
} from "@/lib/data/moves";
import type { PokemonMove } from "@/features/pokemon/types";
import { titleCase } from "@/features/pokemon/utils/format";
import type { GameOption } from "@/features/pokemon/utils/version-group";

export type LearnMethodGroup =
  | "level-up"
  | "reminder"
  | "machine"
  | "egg"
  | "tutor"
  | "train"
  | "form-change"
  | "other";

const METHOD_GROUPS: Record<string, LearnMethodGroup> = {
  "level-up": "level-up",
  reminder: "reminder",
  machine: "machine",
  egg: "egg",
  "light-ball-egg": "egg",
  tutor: "tutor",
  train: "train",
  "form-change": "form-change",
};

export const MOVE_SECTIONS: {
  id: LearnMethodGroup;
  title: string;
  description?: string;
}[] = [
  { id: "level-up", title: "Level up" },
  {
    id: "reminder",
    title: "Move Reminder",
    description: "Only learnable through the Move Reminder.",
  },
  { id: "machine", title: "TM / HM / TR" },
  { id: "egg", title: "Egg moves" },
  { id: "tutor", title: "Move Tutor" },
  {
    id: "train",
    title: "Trainable moves",
    description: "Moves this Pokémon can be trained to use in Pokémon Champions.",
  },
  { id: "form-change", title: "Form change" },
  { id: "other", title: "Other" },
];

export type LearnedMove = {
  key: string;
  name: string;
  label: string;
  method: LearnMethodGroup;
  /** Level for level-up moves (0 = learned on evolution). */
  level: number;
  machine: string | null;
  info: MoveInfo | null;
  /** Type/power/accuracy/PP as they were in the selected game. */
  stats: MoveStatsInGame | null;
  damageClass: DamageClass;
  effect: string | null;
};

export type MoveSection = {
  id: LearnMethodGroup;
  title: string;
  description?: string;
  moves: LearnedMove[];
};

export function getLearnMethodGroup(method: string): LearnMethodGroup {
  return METHOD_GROUPS[method] ?? "other";
}

/** TM/HM/TR label in the selected game (falls back to its DLC). */
export function getMachineLabel(info: MoveInfo, game: GameOption): string | null {
  return (
    info.machines[game.id] ??
    game.members.map((member) => info.machines[member]).find(Boolean) ??
    null
  );
}

/**
 * Every (move, method, level) the Pokémon has in the selected game. A move can
 * appear in several sections, e.g. learned by level-up and by TM.
 */
export function collectLearnedMoves(
  moves: readonly PokemonMove[],
  game: GameOption,
  index: MovesIndex,
): LearnedMove[] {
  const members = new Set(game.members);
  const learned = new Map<string, LearnedMove>();

  for (const entry of moves) {
    const info = index.moves.get(entry.move.name) ?? null;
    for (const detail of entry.version_group_details) {
      if (!members.has(detail.version_group.name)) continue;

      const method = getLearnMethodGroup(detail.move_learn_method.name);
      const level = method === "level-up" ? detail.level_learned_at : 0;
      const key = `${method}:${entry.move.name}:${level}`;
      if (learned.has(key)) continue;

      const stats = info ? getMoveStatsInGame(info, game.id, index) : null;
      learned.set(key, {
        key,
        name: entry.move.name,
        label: info?.label ?? titleCase(entry.move.name),
        method,
        level,
        machine: method === "machine" && info ? getMachineLabel(info, game) : null,
        info,
        stats,
        damageClass: info?.damageClass ?? "status",
        effect: info ? formatMoveEffect(info.effect, stats?.effectChance ?? null) : null,
      });
    }
  }

  return [...learned.values()];
}

const MACHINE_PREFIX_ORDER: Record<string, number> = { TM: 0, HM: 1, TR: 2 };

export function machineSortKey(label: string | null): number {
  const match = label ? /^(TM|HM|TR)(\d+)$/.exec(label) : null;
  if (!match) return Number.MAX_SAFE_INTEGER;
  return MACHINE_PREFIX_ORDER[match[1]] * 10_000 + Number(match[2]);
}

function compareMoves(section: LearnMethodGroup) {
  return (a: LearnedMove, b: LearnedMove) => {
    if (section === "level-up") {
      return a.level - b.level || a.label.localeCompare(b.label);
    }
    if (section === "machine") {
      return machineSortKey(a.machine) - machineSortKey(b.machine) || a.label.localeCompare(b.label);
    }
    return a.label.localeCompare(b.label);
  };
}

export function groupLearnedMoves(moves: readonly LearnedMove[]): MoveSection[] {
  return MOVE_SECTIONS.map((section) => ({
    ...section,
    moves: moves.filter((move) => move.method === section.id).sort(compareMoves(section.id)),
  })).filter((section) => section.moves.length > 0);
}

export function formatLearnLevel(level: number): string {
  return level <= 0 ? "Evo." : String(level);
}

export function formatDamageClass(damageClass: DamageClass): string {
  return damageClass === "physical"
    ? "Physical"
    : damageClass === "special"
      ? "Special"
      : "Status";
}

export function formatMoveValue(value: number | null, suffix = ""): string {
  return value === null ? "—" : `${value}${suffix}`;
}
