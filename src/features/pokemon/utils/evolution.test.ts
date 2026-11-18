import { describe, expect, it } from "vitest";
import { makeCatalog } from "@/test/catalog-fixtures";
import type { ChainLink, EvolutionDetail } from "@/features/pokemon/types";
import { buildEvolutionTree, getStageCount } from "./evolution-chain";
import { formatEvolutionDetail, getEvolutionLabel } from "./evolution-format";

function detail(
  partial: Omit<Partial<EvolutionDetail>, "trigger"> & { trigger: string },
): EvolutionDetail {
  const { trigger, ...rest } = partial;
  return {
    trigger: { name: trigger, url: "" },
    item: null,
    gender: null,
    min_level: null,
    ...rest,
  };
}

function link(
  name: string,
  id: number,
  evolutionDetails: EvolutionDetail[],
  evolvesTo: ChainLink[] = [],
): ChainLink {
  return {
    is_baby: false,
    species: { name, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
    evolution_details: evolutionDetails,
    evolves_to: evolvesTo,
  };
}

const named = (slug: string) => ({ name: slug, url: "" });

describe("formatEvolutionDetail", () => {
  it("formats levels, items, friendship and time of day", () => {
    expect(formatEvolutionDetail(detail({ trigger: "level-up", min_level: 36 }))).toBe("Lv. 36");
    expect(formatEvolutionDetail(detail({ trigger: "use-item", item: named("thunder-stone") }))).toBe(
      "Use Thunder Stone",
    );
    expect(
      formatEvolutionDetail(detail({ trigger: "level-up", min_happiness: 160, time_of_day: "night" })),
    ).toBe("Level up · High Friendship · Night");
    expect(formatEvolutionDetail(detail({ trigger: "trade", held_item: named("kings-rock") }))).toBe(
      "Trade · Holding King's Rock",
    );
  });

  it("handles newer triggers", () => {
    expect(
      formatEvolutionDetail(
        detail({ trigger: "use-move", used_move: named("rage-fist"), min_move_count: 20 }),
        { move: () => "Rage Fist" },
      ),
    ).toBe("Use Rage Fist 20×");
    expect(formatEvolutionDetail(detail({ trigger: "three-defeated-bisharp" }))).toBe(
      "Defeat 3 Bisharp leaders",
    );
  });

  it("prefers the current (is_default) method over older games", () => {
    const leafeon = [
      detail({ trigger: "level-up", near_special_rock: true, location: named("eterna-forest") }),
      detail({ trigger: "use-item", item: named("leaf-stone"), is_default: true }),
    ];
    expect(getEvolutionLabel(leafeon)).toBe("Use Leaf Stone");
  });
});

describe("buildEvolutionTree", () => {
  const catalog = makeCatalog([
    { id: 25, name: "pikachu" },
    { id: 26, name: "raichu" },
    { id: 172, name: "pichu" },
    { id: 10100, name: "raichu-alola", displayName: "Alolan Raichu", speciesId: 26, form: "regional" },
    { id: 10094, name: "pikachu-gmax", displayName: "Gigantamax Pikachu", speciesId: 25, form: "gmax" },
    { id: 133, name: "eevee" },
    { id: 134, name: "vaporeon" },
    { id: 135, name: "jolteon" },
    { id: 470, name: "leafeon" },
    { id: 128, name: "tauros" },
  ]);

  it("adds regional evolutions as their own nodes and lists other forms", () => {
    const chain = {
      ...link("pichu", 172, [], [
        link("pikachu", 25, [detail({ trigger: "level-up", min_happiness: 220, is_default: true })], [
          link("raichu", 26, [
            detail({ trigger: "use-item", item: named("thunder-stone"), is_default: true }),
            detail({
              trigger: "use-item",
              item: named("thunder-stone"),
              is_default: true,
              region: named("alola"),
              evolved_pokemon_form: named("raichu-alola"),
            }),
          ]),
        ]),
      ]),
      is_baby: true,
    };

    const tree = buildEvolutionTree(chain, catalog);
    expect(tree.root.displayName).toBe("Pichu");
    expect(tree.root.isBaby).toBe(true);
    const pikachu = tree.root.children[0];
    expect(pikachu.conditions).toEqual(["Level up · High Friendship"]);
    expect(pikachu.children.map((node) => node.displayName)).toEqual(["Raichu", "Alolan Raichu"]);
    expect(pikachu.children[1].conditions).toEqual(["Use Thunder Stone · In Alola"]);
    expect(tree.nodeCount).toBe(4);
    expect(getStageCount(tree.root)).toBe(3);
    expect(tree.forms.map((form) => form.pokemonName)).toEqual(["pikachu-gmax"]);
  });

  it("builds branching chains", () => {
    const chain = link("eevee", 133, [], [
      link("vaporeon", 134, [detail({ trigger: "use-item", item: named("water-stone") })]),
      link("jolteon", 135, [detail({ trigger: "use-item", item: named("thunder-stone") })]),
      link("leafeon", 470, [
        detail({ trigger: "level-up", near_special_rock: true }),
        detail({ trigger: "use-item", item: named("leaf-stone"), is_default: true }),
      ]),
    ]);
    const tree = buildEvolutionTree(chain, catalog);
    expect(tree.root.children.map((node) => node.pokemonId)).toEqual([134, 135, 470]);
    const leafeon = tree.root.children[2];
    expect(leafeon.conditions).toEqual(["Use Leaf Stone"]);
    expect(leafeon.alternatives).toEqual(["Level up · Near a special rock"]);
  });

  it("reports a single-stage chain", () => {
    const tree = buildEvolutionTree(link("tauros", 128, []), catalog);
    expect(tree.nodeCount).toBe(1);
    expect(tree.root.children).toEqual([]);
  });
});
