import { describe, expect, it } from "vitest";
import {
  formatMultiplier,
  getDefensiveMultiplier,
  groupTypeDefenses,
} from "./type-effectiveness";

describe("getDefensiveMultiplier", () => {
  it("combines both types", () => {
    expect(getDefensiveMultiplier("rock", ["fire", "flying"])).toBe(4);
    expect(getDefensiveMultiplier("ground", ["fire", "flying"])).toBe(0);
    expect(getDefensiveMultiplier("fighting", ["normal", "ghost"])).toBe(0);
    expect(getDefensiveMultiplier("ice", ["dragon", "ground"])).toBe(4);
    expect(getDefensiveMultiplier("fire", ["water", "dragon"])).toBe(0.25);
  });

  it("knows the Fairy and Steel matchups (Gen 6+)", () => {
    expect(getDefensiveMultiplier("dragon", ["fairy"])).toBe(0);
    expect(getDefensiveMultiplier("poison", ["steel"])).toBe(0);
    expect(getDefensiveMultiplier("dark", ["steel"])).toBe(1);
  });
});

describe("groupTypeDefenses", () => {
  it("groups Gengar's weaknesses, resistances and immunities", () => {
    const groups = groupTypeDefenses(["ghost", "poison"]);
    expect(groups.immune.map((entry) => entry.type).sort()).toEqual(["fighting", "normal"]);
    expect(groups.weak.map((entry) => entry.type).sort()).toEqual([
      "dark",
      "ghost",
      "ground",
      "psychic",
    ]);
    expect(groups.resistant.find((entry) => entry.type === "bug")?.multiplier).toBe(0.25);
  });

  it("sorts weaknesses from strongest to weakest", () => {
    const groups = groupTypeDefenses(["fire", "flying"]);
    expect(groups.weak[0]).toEqual({ type: "rock", multiplier: 4 });
  });
});

describe("formatMultiplier", () => {
  it("uses fractions", () => {
    expect(formatMultiplier(0.25)).toBe("¼×");
    expect(formatMultiplier(0.5)).toBe("½×");
    expect(formatMultiplier(4)).toBe("4×");
  });
});
