import { describe, expect, it } from "vitest";
import {
  formatMoveEffect,
  getMoveStatsInGame,
  hydrateMovesIndex,
  type MovesPayload,
} from "@/lib/data/moves";
import type { PokemonMove } from "@/features/pokemon/types";
import {
  collectLearnedMoves,
  getMachineLabel,
  groupLearnedMoves,
  machineSortKey,
} from "./move-groups";
import { getGameOptions, getVersionGroupFamily, pickDefaultGame } from "./version-group";

const payload: MovesPayload = {
  version: 2,
  generatedAt: "2026-01-01T00:00:00.000Z",
  versionGroups: [
    { name: "red-blue", order: 3, generation: 1 },
    { name: "black-white", order: 15, generation: 5 },
    { name: "sun-moon", order: 19, generation: 7 },
    { name: "sword-shield", order: 22, generation: 8 },
    { name: "the-isle-of-armor", order: 23, generation: 8 },
    { name: "scarlet-violet", order: 27, generation: 9 },
    { name: "the-indigo-disk", order: 29, generation: 9 },
    { name: "champions", order: 32, generation: 9 },
  ],
  moves: {
    tackle: {
      id: 33,
      label: "Tackle",
      type: "normal",
      class: "physical",
      power: 40,
      accuracy: 100,
      pp: 35,
      past: [
        { vg: "black-white", power: 35, accuracy: 95 },
        { vg: "sun-moon", power: 50 },
      ],
    },
    bite: {
      id: 44,
      label: "Bite",
      type: "dark",
      class: "physical",
      power: 60,
      accuracy: 100,
      pp: 25,
      effectChance: 30,
      effect: "Has a $effect_chance% chance to make the target flinch.",
      past: [{ vg: "gold-silver", type: "normal", effectChance: 10 }],
    },
    protect: {
      id: 182,
      label: "Protect",
      type: "normal",
      class: "status",
      power: null,
      accuracy: null,
      pp: 10,
      priority: 4,
      machines: { "sword-shield": "TM07", "scarlet-violet": "TM007", "the-indigo-disk": "TM007" },
    },
    "hyper-beam": {
      id: 63,
      label: "Hyper Beam",
      type: "normal",
      class: "special",
      power: 150,
      accuracy: 90,
      pp: 5,
      machines: { "scarlet-violet": "TM163" },
    },
    surf: {
      id: 57,
      label: "Surf",
      type: "water",
      class: "special",
      power: 90,
      accuracy: 100,
      pp: 15,
      machines: { "red-blue": "HM03" },
    },
  },
};
const index = hydrateMovesIndex(payload);

function learn(move: string, ...details: [vg: string, method: string, level: number][]): PokemonMove {
  return {
    move: { name: move, url: "" },
    version_group_details: details.map(([vg, method, level]) => ({
      version_group: { name: vg, url: "" },
      move_learn_method: { name: method, url: "" },
      level_learned_at: level,
    })),
  };
}

describe("getMoveStatsInGame", () => {
  const tackle = index.moves.get("tackle")!;

  it("uses past values that applied before a later change", () => {
    expect(getMoveStatsInGame(tackle, "red-blue", index)).toMatchObject({ power: 35, accuracy: 95 });
    expect(getMoveStatsInGame(tackle, "black-white", index)).toMatchObject({ power: 50, accuracy: 100 });
    expect(getMoveStatsInGame(tackle, "scarlet-violet", index)).toMatchObject({ power: 40, accuracy: 100 });
  });

  it("ignores version groups it doesn't know", () => {
    const bite = index.moves.get("bite")!;
    expect(getMoveStatsInGame(bite, "red-blue", index).type).toBe("dark");
  });

  it("fills in the effect chance", () => {
    expect(formatMoveEffect("Has a $effect_chance% chance to flinch.", 30)).toBe(
      "Has a 30% chance to flinch.",
    );
  });
});

describe("version groups", () => {
  const learnset = [
    learn("tackle", ["scarlet-violet", "level-up", 1], ["sword-shield", "level-up", 1], ["red-blue", "level-up", 1]),
    learn("protect", ["the-indigo-disk", "machine", 0], ["champions", "train", 0]),
  ];

  it("merges DLC into the base game and sorts games newest first", () => {
    expect(getVersionGroupFamily("the-indigo-disk")).toBe("scarlet-violet");
    const games = getGameOptions(learnset, index);
    expect(games.map((game) => game.id)).toEqual([
      "champions",
      "scarlet-violet",
      "sword-shield",
      "red-blue",
    ]);
    expect(games[1].members.sort()).toEqual(["scarlet-violet", "the-indigo-disk"]);
  });

  it("defaults to the newest game with a level-up learnset (not Champions)", () => {
    expect(pickDefaultGame(getGameOptions(learnset, index))?.id).toBe("scarlet-violet");
  });
});

describe("collectLearnedMoves", () => {
  const sv = getGameOptions(
    [learn("tackle", ["scarlet-violet", "level-up", 1])],
    index,
  )[0];

  it("keeps a move in every section it belongs to", () => {
    const moves = collectLearnedMoves(
      [
        learn("hyper-beam", ["scarlet-violet", "level-up", 50], ["scarlet-violet", "machine", 0]),
        learn("tackle", ["scarlet-violet", "level-up", 1], ["the-indigo-disk", "level-up", 1]),
      ],
      sv,
      index,
    );
    const sections = groupLearnedMoves(moves);
    expect(sections.map((section) => section.id)).toEqual(["level-up", "machine"]);
    expect(sections[0].moves.map((move) => move.label)).toEqual(["Tackle", "Hyper Beam"]);
    expect(sections[1].moves[0].machine).toBe("TM163");
  });

  it("labels machines from the game or its DLC", () => {
    const protect = index.moves.get("protect")!;
    expect(getMachineLabel(protect, sv)).toBe("TM007");
  });

  it("sorts TMs before HMs before TRs", () => {
    expect(machineSortKey("TM05")).toBeLessThan(machineSortKey("HM01"));
    expect(machineSortKey("HM01")).toBeLessThan(machineSortKey("TR00"));
    expect(machineSortKey(null)).toBe(Number.MAX_SAFE_INTEGER);
  });
});
