import type { Catalog, CatalogPokemon, FormKind } from "@/lib/data/catalog";
import type { ChainLink, EvolutionDetail } from "@/features/pokemon/types";
import { extractIdFromUrl } from "@/lib/pokeapi/client";
import {
  formatEvolutionConditions,
  getCurrentEvolutionDetails,
  type NameResolvers,
} from "@/features/pokemon/utils/evolution-format";
import { titleCase } from "@/features/pokemon/utils/format";

export type EvolutionNode = {
  key: string;
  speciesId: number;
  pokemonId: number;
  pokemonName: string;
  displayName: string;
  isBaby: boolean;
  /** How the previous stage evolves into this one (empty for the first stage). */
  conditions: string[];
  /** Methods from older games, when they differ. */
  alternatives: string[];
  /** Only this form evolves, e.g. "Galarian Meowth". */
  fromForm: string | null;
  children: EvolutionNode[];
};

export type EvolutionForm = {
  pokemonId: number;
  pokemonName: string;
  displayName: string;
  speciesId: number;
  kind: FormKind;
};

export type EvolutionTree = {
  root: EvolutionNode;
  /** Number of nodes in the chain (1 = does not evolve). */
  nodeCount: number;
  /** Alternate forms of the chain's species not already shown as nodes. */
  forms: EvolutionForm[];
};

const FORM_KIND_ORDER: Record<FormKind, number> = {
  mega: 0,
  gmax: 1,
  primal: 2,
  regional: 3,
  other: 4,
};

/**
 * Builds the evolution tree from the PokéAPI chain plus the static catalog.
 * Regional evolutions (PokéAPI `evolved_pokemon_form`, e.g. Alolan Raichu)
 * become their own nodes; Megas, Gigantamax and other forms are listed
 * separately. No extra requests are needed.
 */
export function buildEvolutionTree(
  chain: ChainLink,
  catalog: Catalog,
  names: NameResolvers = {},
): EvolutionTree {
  const resolvers: NameResolvers = {
    move: names.move,
    pokemon: (slug) =>
      catalog.byName.get(slug)?.displayName ?? names.pokemon?.(slug) ?? titleCase(slug),
  };
  const shown = new Set<number>();
  const speciesInChain = new Set<number>();
  let nodeCount = 0;

  function createNode(
    link: ChainLink,
    pokemon: CatalogPokemon | undefined,
    conditions: string[],
    alternatives: string[],
    fromForm: string | null,
  ): EvolutionNode {
    const speciesId = extractIdFromUrl(link.species.url);
    speciesInChain.add(speciesId);
    nodeCount += 1;
    if (pokemon) shown.add(pokemon.id);
    return {
      key: pokemon?.name ?? link.species.name,
      speciesId,
      pokemonId: pokemon?.id ?? speciesId,
      pokemonName: pokemon?.name ?? link.species.name,
      displayName: pokemon?.displayName ?? titleCase(link.species.name),
      isBaby: link.is_baby,
      conditions,
      alternatives,
      fromForm,
      children: [],
    };
  }

  function requiredFormName(details: EvolutionDetail[]): string | null {
    const slug = details.find((detail) => detail.required_pokemon_form)?.required_pokemon_form
      ?.name;
    const form = slug ? catalog.byName.get(slug) : undefined;
    return form && !form.isDefault ? form.displayName : null;
  }

  function buildStage(link: ChainLink): EvolutionNode[] {
    const speciesId = extractIdFromUrl(link.species.url);
    const defaultPokemon = catalog.bySpecies.get(speciesId);
    const current = getCurrentEvolutionDetails(link.evolution_details);
    const older = link.evolution_details.filter((detail) => !current.includes(detail));

    // Group the current methods by the form they evolve into.
    const groups = new Map<string, EvolutionDetail[]>([["", []]]);
    for (const detail of current) {
      const formSlug = detail.evolved_pokemon_form?.name ?? "";
      const variant = formSlug ? catalog.byName.get(formSlug) : undefined;
      const key = variant && !variant.isDefault ? formSlug : "";
      groups.set(key, [...(groups.get(key) ?? []), detail]);
    }

    const nodes: EvolutionNode[] = [];
    for (const [formSlug, details] of groups) {
      if (formSlug && details.length === 0) continue;
      const pokemon = formSlug ? catalog.byName.get(formSlug) : defaultPokemon;
      if (pokemon && shown.has(pokemon.id)) continue;
      const { labels, alternatives } = formatEvolutionConditions(
        details,
        formSlug ? [] : older,
        resolvers,
      );
      const node = createNode(link, pokemon, labels, alternatives, requiredFormName(details));
      if (!formSlug) {
        node.children = link.evolves_to.flatMap(buildStage);
      }
      nodes.push(node);
    }
    return nodes;
  }

  const rootSpeciesId = extractIdFromUrl(chain.species.url);
  const root = createNode(chain, catalog.bySpecies.get(rootSpeciesId), [], [], null);
  root.children = chain.evolves_to.flatMap(buildStage);

  const forms: EvolutionForm[] = [...speciesInChain]
    .flatMap((speciesId) => catalog.formsBySpecies.get(speciesId) ?? [])
    .filter((form) => !shown.has(form.id))
    .map((form) => ({
      pokemonId: form.id,
      pokemonName: form.name,
      displayName: form.displayName,
      speciesId: form.speciesId,
      kind: form.form?.kind ?? "other",
    }))
    .sort(
      (a, b) =>
        FORM_KIND_ORDER[a.kind] - FORM_KIND_ORDER[b.kind] ||
        a.speciesId - b.speciesId ||
        a.pokemonId - b.pokemonId,
    );

  return { root, nodeCount, forms };
}

/** Longest path from the root, e.g. 3 for Bulbasaur → Ivysaur → Venusaur. */
export function getStageCount(node: EvolutionNode): number {
  return 1 + Math.max(0, ...node.children.map(getStageCount));
}
