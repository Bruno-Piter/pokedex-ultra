"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { findCatalogPokemon, type CatalogPokemon, type FormKind } from "@/lib/data/catalog";
import type { StatName } from "@/features/pokemon/types";
import {
  evolutionChainQuery,
  pokemonQuery,
  speciesQuery,
} from "@/features/pokemon/api/queries";
import type { PokemonDetail, SpeciesDetail } from "@/features/pokemon/api/pokemon.api";
import { useCatalog } from "@/features/pokemon/hooks/use-catalog";
import { titleCase } from "@/features/pokemon/utils/format";
import { getBaseStatTotal } from "@/features/pokemon/utils/stats-calculator";

/** What the hero needs — available instantly from the catalog when it's loaded. */
export type PokemonSummary = {
  id: number;
  name: string;
  speciesId: number;
  displayName: string;
  types: string[];
  stats: Record<StatName, number>;
  bst: number;
  abilities: { name: string; hidden: boolean }[];
  height: number;
  weight: number;
  baseExperience: number | null;
  sprites: number | undefined;
  form: { kind: FormKind; battleOnly: boolean } | null;
  legendary: boolean;
  mythical: boolean;
};

function fromCatalog(entry: CatalogPokemon): PokemonSummary {
  return {
    id: entry.id,
    name: entry.name,
    speciesId: entry.speciesId,
    displayName: entry.displayName,
    types: entry.types,
    stats: entry.stats,
    bst: entry.bst,
    abilities: entry.abilities,
    height: entry.height,
    weight: entry.weight,
    baseExperience: entry.baseExperience,
    sprites: entry.sprites,
    form: entry.form,
    legendary: entry.legendary,
    mythical: entry.mythical,
  };
}

function fromDetail(detail: PokemonDetail, species?: SpeciesDetail): PokemonSummary {
  return {
    id: detail.id,
    name: detail.name,
    speciesId: detail.speciesId,
    displayName:
      detail.isDefault && species ? species.displayName : titleCase(detail.name),
    types: detail.types,
    stats: detail.stats,
    bst: getBaseStatTotal(detail.stats),
    abilities: detail.abilities,
    height: detail.height,
    weight: detail.weight,
    baseExperience: detail.baseExperience,
    sprites: undefined,
    form: detail.isDefault ? null : { kind: "other", battleOnly: false },
    legendary: species?.isLegendary ?? false,
    mythical: species?.isMythical ?? false,
  };
}

/**
 * Data for /pokemon/[id]. The summary comes from the static catalog (no
 * waiting), while the learnset and species load in parallel.
 */
export function usePokemonDetail(idParam: string) {
  const catalog = useCatalog();
  const entry = catalog.data ? findCatalogPokemon(catalog.data, idParam) : undefined;

  const pokemon = useQuery(pokemonQuery(entry?.id ?? idParam));
  const speciesId = entry?.speciesId ?? pokemon.data?.speciesId ?? null;
  const species = useQuery({
    ...speciesQuery(speciesId ?? 0),
    enabled: speciesId !== null,
  });

  const summary = useMemo(() => {
    if (entry) return fromCatalog(entry);
    if (pokemon.data) return fromDetail(pokemon.data, species.data);
    return null;
  }, [entry, pokemon.data, species.data]);

  return { catalog, entry, pokemon, species, summary };
}

export function useEvolutionChain(chainId: number | null | undefined) {
  return useQuery({
    ...evolutionChainQuery(chainId ?? 0),
    enabled: typeof chainId === "number",
  });
}

/** Learnset of the base form when a form (e.g. Gigantamax) has none of its own. */
export function useLearnsetSource(
  pokemon: PokemonDetail | undefined,
  basePokemonId: number | undefined,
) {
  const needsBase =
    !!pokemon && pokemon.moves.length === 0 && !!basePokemonId && basePokemonId !== pokemon.id;
  const base = useQuery({ ...pokemonQuery(basePokemonId ?? 0), enabled: needsBase });
  return {
    moves: needsBase ? base.data?.moves : pokemon?.moves,
    fromBase: needsBase,
    baseQuery: base,
  };
}
