import { fetchDataFile } from "@/lib/data/version";

export type DamageClass = "physical" | "special" | "status";

export type MovePastValue = {
  vg: string;
  power?: number;
  accuracy?: number;
  pp?: number;
  effectChance?: number;
  type?: string;
};

type MovePayload = {
  id: number;
  label: string;
  type: string;
  class: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority?: number;
  effectChance?: number;
  effect?: string;
  machines?: Record<string, string>;
  past?: MovePastValue[];
};

export type VersionGroupInfo = {
  name: string;
  order: number;
  generation: number;
};

export type MovesPayload = {
  version: number;
  generatedAt: string;
  versionGroups: VersionGroupInfo[];
  moves: Record<string, MovePayload>;
};

export type MoveInfo = {
  name: string;
  id: number;
  /** Official English name, e.g. "U-turn". */
  label: string;
  type: string;
  damageClass: DamageClass;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number;
  effectChance: number | null;
  /** Short effect; may contain `$effect_chance`. */
  effect: string | null;
  /** TM/HM/TR label per version group. */
  machines: Readonly<Record<string, string>>;
  /** Values that applied before each listed version group. */
  past: readonly MovePastValue[];
};

export type MovesIndex = {
  moves: ReadonlyMap<string, MoveInfo>;
  /** Ordered from oldest to newest. */
  versionGroups: readonly VersionGroupInfo[];
  versionGroupByName: ReadonlyMap<string, VersionGroupInfo>;
};

/** Stats of a move as they were in a specific game. */
export type MoveStatsInGame = {
  type: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  effectChance: number | null;
};

function toDamageClass(value: string): DamageClass {
  return value === "physical" || value === "special" ? value : "status";
}

export function hydrateMovesIndex(payload: MovesPayload): MovesIndex {
  if (payload?.version !== 2 || !payload.moves) {
    throw new Error("Unsupported moves format");
  }

  const moves = new Map<string, MoveInfo>();
  for (const [name, move] of Object.entries(payload.moves)) {
    moves.set(name, {
      name,
      id: move.id,
      label: move.label,
      type: move.type,
      damageClass: toDamageClass(move.class),
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      priority: move.priority ?? 0,
      effectChance: move.effectChance ?? null,
      effect: move.effect ?? null,
      machines: move.machines ?? {},
      past: move.past ?? [],
    });
  }

  const versionGroups = [...payload.versionGroups].sort((a, b) => a.order - b.order);
  return {
    moves,
    versionGroups,
    versionGroupByName: new Map(versionGroups.map((vg) => [vg.name, vg])),
  };
}

export async function fetchMovesIndex(signal?: AbortSignal): Promise<MovesIndex> {
  return hydrateMovesIndex(await fetchDataFile<MovesPayload>("moves.json", signal));
}

/**
 * PokéAPI `past_values` list the values that were in effect *before* the
 * listed version group. For each field, the earliest change after the
 * selected game wins; otherwise the current value applies.
 */
export function getMoveStatsInGame(
  move: MoveInfo,
  versionGroupName: string,
  index: Pick<MovesIndex, "versionGroupByName">,
): MoveStatsInGame {
  const current: MoveStatsInGame = {
    type: move.type,
    power: move.power,
    accuracy: move.accuracy,
    pp: move.pp,
    effectChance: move.effectChance,
  };

  const selectedOrder = index.versionGroupByName.get(versionGroupName)?.order;
  if (selectedOrder === undefined || move.past.length === 0) return current;

  // Changes tied to a version group we can't place in time are ignored.
  const later = move.past
    .map((value) => ({ value, order: index.versionGroupByName.get(value.vg)?.order }))
    .filter(
      (entry): entry is { value: MovePastValue; order: number } =>
        entry.order !== undefined && entry.order > selectedOrder,
    )
    .sort((a, b) => a.order - b.order);

  const pick = <K extends keyof MovePastValue>(key: K) =>
    later.find((entry) => entry.value[key] !== undefined)?.value[key];

  return {
    type: pick("type") ?? current.type,
    power: pick("power") ?? current.power,
    accuracy: pick("accuracy") ?? current.accuracy,
    pp: pick("pp") ?? current.pp,
    effectChance: pick("effectChance") ?? current.effectChance,
  };
}

export function formatMoveEffect(
  effect: string | null,
  effectChance: number | null,
): string | null {
  if (!effect) return null;
  return effect.replace(/\$effect_chance/g, effectChance != null ? String(effectChance) : "");
}
