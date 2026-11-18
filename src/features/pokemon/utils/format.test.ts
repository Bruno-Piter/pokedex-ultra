import { describe, expect, it } from "vitest";
import {
  formatDexNumber,
  formatGenderRate,
  formatHeight,
  formatWeight,
  getCatchChance,
  getFemaleRatio,
  getTypeTextColor,
  titleCase,
} from "./format";

describe("formatDexNumber", () => {
  it("pads to 3 digits", () => {
    expect(formatDexNumber(6)).toBe("#006");
    expect(formatDexNumber(25)).toBe("#025");
    expect(formatDexNumber(1000)).toBe("#1000");
  });
});

describe("titleCase", () => {
  it("turns slugs into words", () => {
    expect(titleCase("thunder-stone")).toBe("Thunder Stone");
    expect(titleCase("lets-go")).toBe("Lets Go");
  });
});

describe("units", () => {
  it("formats height and weight from decimetres/hectograms", () => {
    expect(formatHeight(17)).toBe("1.7 m");
    expect(formatWeight(905)).toBe("90.5 kg");
  });
});

describe("gender", () => {
  it("handles genderless and ratios", () => {
    expect(getFemaleRatio(-1)).toBeNull();
    expect(formatGenderRate(-1)).toBe("Genderless");
    expect(getFemaleRatio(1)).toBe(12.5);
    expect(formatGenderRate(4)).toBe("50% ♂ · 50% ♀");
  });
});

describe("getCatchChance", () => {
  it("is capped at 100%", () => {
    expect(getCatchChance(255)).toBeCloseTo(33.3, 1);
    expect(getCatchChance(3)).toBeCloseTo(0.39, 2);
  });
});

describe("getTypeTextColor", () => {
  it("uses dark text on light type colors", () => {
    expect(getTypeTextColor("electric")).toBe("#1a1a1a");
    expect(getTypeTextColor("dragon")).toBe("#ffffff");
  });
});
