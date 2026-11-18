import { describe, expect, it } from "vitest";
import { makeCatalog } from "@/test/catalog-fixtures";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  filterAndSortCatalog,
  hasActiveFilters,
  matchesSearch,
  type FilterState,
} from "./catalog-filters";

function filters(overrides: Partial<FilterState> = {}): FilterState {
  return { ...DEFAULT_FILTERS, ...overrides };
}

const catalog = makeCatalog([
  { id: 1, name: "bulbasaur", types: ["grass", "poison"], moves: ["tackle", "growl", "vine-whip"], stats: [45, 49, 49, 65, 65, 45] },
  { id: 4, name: "charmander", types: ["fire"], moves: ["scratch", "growl", "ember"], stats: [39, 52, 43, 60, 50, 65] },
  { id: 6, name: "charizard", types: ["fire", "flying"], moves: ["scratch", "ember"], stats: [78, 84, 78, 109, 85, 100] },
  { id: 7, name: "squirtle", types: ["water"], moves: ["tackle", "tail-whip", "water-gun"], stats: [44, 48, 65, 50, 64, 43] },
  { id: 122, name: "mr-mime", displayName: "Mr. Mime", types: ["psychic", "fairy"] },
  { id: 152, name: "chikorita", types: ["grass"], generation: 2 },
  {
    id: 10034,
    name: "charizard-mega-x",
    displayName: "Mega Charizard X",
    speciesId: 6,
    types: ["fire", "dragon"],
    form: "mega",
    stats: [78, 130, 111, 130, 85, 100],
  },
]);
const list = catalog.list;
const names = (result: { name: string }[]) => result.map((pokemon) => pokemon.name);

describe("countActiveFilters", () => {
  it("is zero for the defaults", () => {
    expect(countActiveFilters(filters())).toBe(0);
    expect(hasActiveFilters(filters())).toBe(false);
  });

  it("counts types, generation, moves, hidden forms and a custom sort", () => {
    expect(countActiveFilters(filters({ types: ["fire", "water"] }))).toBe(2);
    expect(countActiveFilters(filters({ generation: 1 }))).toBe(1);
    expect(countActiveFilters(filters({ moves: ["tackle", "growl"] }))).toBe(2);
    expect(countActiveFilters(filters({ showForms: false }))).toBe(1);
    expect(countActiveFilters(filters({ sort: "name" }))).toBe(1);
    expect(countActiveFilters(filters({ direction: "desc" }))).toBe(1);
  });

  it("treats a search as active without counting it as a panel filter", () => {
    expect(countActiveFilters(filters({ search: "char" }))).toBe(0);
    expect(hasActiveFilters(filters({ search: "char" }))).toBe(true);
  });
});

describe("matchesSearch", () => {
  const charizard = catalog.byId.get(6)!;
  const mrMime = catalog.byId.get(122)!;
  const megaX = catalog.byId.get(10034)!;

  it("matches names, display names and words in any order", () => {
    expect(matchesSearch(charizard, "char")).toBe(true);
    expect(matchesSearch(mrMime, "mr. mime")).toBe(true);
    expect(matchesSearch(mrMime, "mr mime")).toBe(true);
    expect(matchesSearch(megaX, "mega x")).toBe(true);
    expect(matchesSearch(megaX, "x charizard")).toBe(true);
    expect(matchesSearch(charizard, "pikachu")).toBe(false);
  });

  it("matches dex numbers by prefix, or exactly when zero-padded", () => {
    expect(matchesSearch(charizard, "6")).toBe(true);
    expect(matchesSearch(charizard, "#006")).toBe(true);
    expect(matchesSearch(megaX, "#006")).toBe(true);
    expect(matchesSearch(catalog.byId.get(152)!, "15")).toBe(true);
    expect(matchesSearch(catalog.byId.get(152)!, "015")).toBe(false);
  });
});

describe("filterAndSortCatalog", () => {
  it("lists forms right after their species when sorting by number", () => {
    expect(names(filterAndSortCatalog(list, filters()))).toEqual([
      "bulbasaur",
      "charmander",
      "charizard",
      "charizard-mega-x",
      "squirtle",
      "mr-mime",
      "chikorita",
    ]);
  });

  it("can hide alternate forms", () => {
    expect(names(filterAndSortCatalog(list, filters({ showForms: false })))).not.toContain(
      "charizard-mega-x",
    );
  });

  it("requires every selected type", () => {
    expect(names(filterAndSortCatalog(list, filters({ types: ["fire", "flying"] })))).toEqual([
      "charizard",
    ]);
  });

  it("filters by generation, including forms of that generation's species", () => {
    expect(names(filterAndSortCatalog(list, filters({ generation: 2 })))).toEqual(["chikorita"]);
    expect(names(filterAndSortCatalog(list, filters({ generation: 1 })))).toContain(
      "charizard-mega-x",
    );
  });

  it("requires every selected move (AND)", () => {
    expect(names(filterAndSortCatalog(list, filters({ moves: ["tackle", "growl"] })))).toEqual([
      "bulbasaur",
    ]);
    expect(filterAndSortCatalog(list, filters({ moves: ["ember", "water-gun"] }))).toEqual([]);
  });

  it("combines move and type filters", () => {
    expect(
      names(filterAndSortCatalog(list, filters({ types: ["water"], moves: ["tackle"] }))),
    ).toEqual(["squirtle"]);
  });

  it("sorts by a stat, by the average of several, or by BST", () => {
    const byAttack = filterAndSortCatalog(
      list,
      filters({ sort: "stats", sortStats: ["attack"], direction: "desc" }),
    );
    expect(byAttack[0].name).toBe("charizard-mega-x");

    const bySpeedAndSpAtk = filterAndSortCatalog(
      list,
      filters({ sort: "stats", sortStats: ["speed", "special-attack"], direction: "desc", showForms: false }),
    );
    expect(bySpeedAndSpAtk[0].name).toBe("charizard");

    const byBst = filterAndSortCatalog(list, filters({ sort: "stats", direction: "asc" }));
    expect(byBst[0].bst).toBeLessThanOrEqual(byBst[1].bst);
  });

  it("sorts by name both ways", () => {
    const asc = names(filterAndSortCatalog(list, filters({ sort: "name", showForms: false })));
    expect(asc[0]).toBe("bulbasaur");
    const desc = names(
      filterAndSortCatalog(list, filters({ sort: "name", direction: "desc", showForms: false })),
    );
    expect(desc[0]).toBe("squirtle");
  });
});
