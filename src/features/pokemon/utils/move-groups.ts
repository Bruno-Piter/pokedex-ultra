import type {
  EnrichedMove,
  LearnMethod,
  MoveData,
  MoveSection,
  NormalizedMove,
  PokemonMove,
} from "@/features/pokemon/types";

const SECTION_ORDER: { id: LearnMethod; title: string }[] = [
  { id: "level-up", title: "Level Up" },
  { id: "machine", title: "TM & HM" },
  { id: "egg", title: "Egg Moves" },
  { id: "tutor", title: "Tutor" },
];

function parseLearnMethod(name: string): LearnMethod {
  if (
    name === "level-up" ||
    name === "machine" ||
    name === "egg" ||
    name === "tutor"
  ) {
    return name;
  }
  return "unknown";
}

export function normalizeMovesForVersionGroup(
  moves: PokemonMove[],
  versionGroupName: string,
): NormalizedMove[] {
  const normalized: NormalizedMove[] = [];

  for (const entry of moves) {
    const detail = entry.version_group_details.find(
      (d) => d.version_group.name === versionGroupName,
    );
    if (!detail) continue;

    normalized.push({
      name: entry.move.name,
      method: parseLearnMethod(detail.move_learn_method.name),
      level: detail.level_learned_at,
      versionGroup: versionGroupName,
    });
  }

  return normalized;
}

export function enrichMoves(
  normalized: NormalizedMove[],
  moveDetails: Map<string, MoveData>,
  tmMap: Map<string, number>,
): EnrichedMove[] {
  return normalized.map((move) => {
    const details = moveDetails.get(move.name);
    return {
      ...move,
      type: details?.type.name ?? "normal",
      damageClass: details?.damage_class.name ?? "status",
      power: details?.power ?? null,
      accuracy: details?.accuracy ?? null,
      pp: details?.pp ?? null,
      tmNumber: move.method === "machine" ? (tmMap.get(move.name) ?? null) : null,
    };
  });
}

function sortMoves(a: EnrichedMove, b: EnrichedMove): number {
  if (a.method === "level-up" && b.method === "level-up") {
    return a.level - b.level || a.name.localeCompare(b.name);
  }
  if (a.method === "machine" && b.method === "machine") {
    const tmA = a.tmNumber ?? Number.MAX_SAFE_INTEGER;
    const tmB = b.tmNumber ?? Number.MAX_SAFE_INTEGER;
    return tmA - tmB || a.name.localeCompare(b.name);
  }
  return a.name.localeCompare(b.name);
}

export function groupMovesByMethod(moves: EnrichedMove[]): MoveSection[] {
  const sections: MoveSection[] = [];

  for (const { id, title } of SECTION_ORDER) {
    const sectionMoves = moves.filter((m) => m.method === id).sort(sortMoves);
    if (sectionMoves.length > 0) {
      sections.push({ id, title, moves: sectionMoves });
    }
  }

  return sections;
}

export function formatDamageClass(damageClass: string): string {
  switch (damageClass) {
    case "physical":
      return "Physical";
    case "special":
      return "Special";
    default:
      return "Status";
  }
}

export function formatMoveStat(value: number | null): string {
  return value === null ? "—" : String(value);
}

export function formatTmNumber(number: number | null): string {
  if (number === null) return "—";
  return `TM${String(number).padStart(3, "0")}`;
}
