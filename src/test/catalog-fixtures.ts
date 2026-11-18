import { hydrateCatalog, type Catalog, type CatalogPayload, type FormKind } from "@/lib/data/catalog";

type StubPokemon = {
  id: number;
  name: string;
  speciesId?: number;
  displayName?: string;
  types?: string[];
  stats?: number[];
  moves?: string[];
  generation?: number;
  height?: number;
  weight?: number;
  form?: FormKind;
  abilities?: [string, boolean][];
};

/** Builds a hydrated catalog from a few hand-written entries. */
export function makeCatalog(entries: StubPokemon[]): Catalog {
  const moveNames = [...new Set(entries.flatMap((entry) => entry.moves ?? []))].sort();
  const payload: CatalogPayload = {
    version: 2,
    generatedAt: "2026-01-01T00:00:00.000Z",
    moveNames,
    abilities: { overgrow: { name: "Overgrow", effect: "Boosts Grass moves." } },
    pokemon: entries.map((entry) => ({
      id: entry.id,
      name: entry.name,
      speciesId: entry.speciesId ?? entry.id,
      displayName:
        entry.displayName ?? entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
      isDefault: !entry.form,
      generation: entry.generation ?? 1,
      types: entry.types ?? ["normal"],
      stats: entry.stats ?? [45, 49, 49, 65, 65, 45],
      abilities: entry.abilities ?? [["overgrow", false]],
      height: entry.height ?? 10,
      weight: entry.weight ?? 100,
      baseExperience: 64,
      sprites: 63,
      moves: (entry.moves ?? []).map((move) => moveNames.indexOf(move)),
      ...(entry.form ? { form: { kind: entry.form, battleOnly: entry.form === "mega" } } : {}),
    })),
  };
  return hydrateCatalog(payload);
}
