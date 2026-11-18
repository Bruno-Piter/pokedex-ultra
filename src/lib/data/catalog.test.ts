import { describe, expect, it } from "vitest";
import { makeCatalog } from "@/test/catalog-fixtures";
import { findCatalogPokemon, getDexNeighbors, normalizeSearchText } from "./catalog";

const catalog = makeCatalog([
  { id: 1, name: "bulbasaur", moves: ["tackle", "growl"] },
  { id: 2, name: "ivysaur" },
  { id: 3, name: "venusaur", stats: [80, 82, 83, 100, 100, 80] },
  { id: 10033, name: "venusaur-mega", displayName: "Mega Venusaur", speciesId: 3, form: "mega" },
]);

describe("hydrateCatalog", () => {
  it("indexes Pokémon by id, name and species", () => {
    expect(catalog.byId.get(3)?.name).toBe("venusaur");
    expect(catalog.byName.get("venusaur-mega")?.speciesId).toBe(3);
    expect(catalog.bySpecies.get(3)?.id).toBe(3);
    expect(catalog.formsBySpecies.get(3)?.map((form) => form.id)).toEqual([10033]);
    expect(catalog.speciesIds).toEqual([1, 2, 3]);
  });

  it("decodes stats, BST and moves", () => {
    const venusaur = catalog.byId.get(3)!;
    expect(venusaur.stats["special-attack"]).toBe(100);
    expect(venusaur.bst).toBe(525);
    expect(catalog.byId.get(1)!.moves.has("growl")).toBe(true);
    expect(catalog.abilities.get("overgrow")?.name).toBe("Overgrow");
  });
});

describe("helpers", () => {
  it("finds by id or slug", () => {
    expect(findCatalogPokemon(catalog, "2")?.name).toBe("ivysaur");
    expect(findCatalogPokemon(catalog, "Venusaur-Mega")?.id).toBe(10033);
    expect(findCatalogPokemon(catalog, "missingno")).toBeUndefined();
  });

  it("returns dex neighbors", () => {
    expect(getDexNeighbors(catalog, 2)).toMatchObject({
      prev: { name: "bulbasaur" },
      next: { name: "venusaur" },
    });
    expect(getDexNeighbors(catalog, 1).prev).toBeNull();
  });

  it("normalizes search text", () => {
    expect(normalizeSearchText("Flabébé")).toBe("flabebe");
    expect(normalizeSearchText("Mr. Mime")).toBe("mr mime");
    expect(normalizeSearchText("Farfetch’d")).toBe("farfetch d");
  });
});
