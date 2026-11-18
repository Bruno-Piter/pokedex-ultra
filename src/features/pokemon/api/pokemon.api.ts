import { extractIdFromUrl, pokeFetch } from "@/lib/pokeapi/client";
import type {
  EvolutionChain,
  FlavorText,
  Pokemon,
  PokemonMove,
  PokemonSpecies,
  StatName,
} from "@/features/pokemon/types";

/**
 * Slim versions of the PokéAPI payloads. Raw /pokemon responses reach
 * hundreds of KB (sprites, game indices…); keeping only what the UI uses
 * keeps memory flat while browsing many Pokémon on a phone.
 */
export type PokemonDetail = {
  id: number;
  name: string;
  speciesId: number;
  isDefault: boolean;
  baseExperience: number | null;
  height: number;
  weight: number;
  types: string[];
  stats: Record<StatName, number>;
  abilities: { name: string; hidden: boolean }[];
  moves: PokemonMove[];
};

export type SpeciesDetail = {
  id: number;
  name: string;
  displayName: string;
  genus: string | null;
  flavorText: string | null;
  genderRate: number;
  captureRate: number;
  baseHappiness: number | null;
  hatchCounter: number | null;
  growthRate: string | null;
  eggGroups: string[];
  habitat: string | null;
  color: string | null;
  shape: string | null;
  generation: number;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  evolutionChainId: number | null;
};

function englishFlavorText(entries: FlavorText[]): string | null {
  const english = entries.filter((entry) => entry.language.name === "en");
  const latest = english[english.length - 1]?.flavor_text;
  if (!latest) return null;
  return latest
    .replace(/[\f\n\r]+/g, " ")
    .replace(/­/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function toPokemonDetail(raw: Pokemon): PokemonDetail {
  const stats = {} as Record<StatName, number>;
  for (const entry of raw.stats) {
    stats[entry.stat.name as StatName] = entry.base_stat;
  }

  return {
    id: raw.id,
    name: raw.name,
    speciesId: extractIdFromUrl(raw.species.url),
    isDefault: raw.is_default ?? true,
    baseExperience: raw.base_experience ?? null,
    height: raw.height,
    weight: raw.weight,
    types: [...raw.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
    stats,
    abilities: [...raw.abilities]
      .sort((a, b) => a.slot - b.slot)
      .map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    moves: raw.moves.map((entry) => ({
      move: { name: entry.move.name, url: "" },
      version_group_details: entry.version_group_details.map((detail) => ({
        level_learned_at: detail.level_learned_at,
        move_learn_method: { name: detail.move_learn_method.name, url: "" },
        version_group: { name: detail.version_group.name, url: "" },
      })),
    })),
  };
}

export function toSpeciesDetail(raw: PokemonSpecies): SpeciesDetail {
  const english = <T extends { language: { name: string } }>(entries: T[]) =>
    entries.find((entry) => entry.language.name === "en");

  return {
    id: raw.id,
    name: raw.name,
    displayName: english(raw.names)?.name ?? raw.name,
    genus: english(raw.genera ?? [])?.genus ?? null,
    flavorText: englishFlavorText(raw.flavor_text_entries ?? []),
    genderRate: raw.gender_rate,
    captureRate: raw.capture_rate,
    baseHappiness: raw.base_happiness ?? null,
    hatchCounter: raw.hatch_counter ?? null,
    growthRate: raw.growth_rate?.name ?? null,
    eggGroups: (raw.egg_groups ?? []).map((group) => group.name),
    habitat: raw.habitat?.name ?? null,
    color: raw.color?.name ?? null,
    shape: raw.shape?.name ?? null,
    generation: extractIdFromUrl(raw.generation.url),
    isBaby: raw.is_baby,
    isLegendary: raw.is_legendary,
    isMythical: raw.is_mythical,
    evolutionChainId: raw.evolution_chain?.url
      ? extractIdFromUrl(raw.evolution_chain.url)
      : null,
  };
}

export async function getPokemon(
  idOrName: string | number,
  signal?: AbortSignal,
): Promise<PokemonDetail> {
  const raw = await pokeFetch<Pokemon>(
    `/pokemon/${String(idOrName).toLowerCase()}`,
    { signal },
  );
  return toPokemonDetail(raw);
}

export async function getPokemonSpecies(
  id: number,
  signal?: AbortSignal,
): Promise<SpeciesDetail> {
  const raw = await pokeFetch<PokemonSpecies>(`/pokemon-species/${id}`, { signal });
  return toSpeciesDetail(raw);
}

export async function getEvolutionChain(
  id: number,
  signal?: AbortSignal,
): Promise<EvolutionChain> {
  return pokeFetch<EvolutionChain>(`/evolution-chain/${id}`, { signal });
}
