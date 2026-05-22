import { extractIdFromUrl, pokeFetch } from "@/lib/pokeapi/client";
import { POKEAPI_ENDPOINTS } from "@/lib/pokeapi/endpoints";
import type {
  AbilityData,
  EvolutionChain,
  Machine,
  MoveData,
  NamedResource,
  Pokemon,
  PokemonSpecies,
  ResourceList,
  TypeData,
  VersionGroup,
} from "@/features/pokemon/types";

const PAGE_SIZE = 24;
const BATCH_CONCURRENCY = 10;

async function fetchInBatches<T>(
  items: string[],
  fetcher: (item: string) => Promise<T>,
  concurrency = BATCH_CONCURRENCY,
): Promise<Map<string, T>> {
  const results = new Map<string, T>();
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (item) => [item, await fetcher(item)] as const),
    );
    for (const [key, value] of batchResults) {
      results.set(key, value);
    }
  }
  return results;
}

export function parseTmNumberFromItem(itemName: string): number | null {
  const match = itemName.match(/^tm(\d+)$/i);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

export async function getPokemonList(
  offset = 0,
  limit = PAGE_SIZE,
): Promise<ResourceList> {
  return pokeFetch<ResourceList>(
    `${POKEAPI_ENDPOINTS.pokemon}?limit=${limit}&offset=${offset}`,
  );
}

export async function getPokemonByIdOrName(
  idOrName: string | number,
): Promise<Pokemon> {
  return pokeFetch<Pokemon>(`${POKEAPI_ENDPOINTS.pokemon}/${idOrName}`);
}

export async function getPokemonSpecies(id: number): Promise<PokemonSpecies> {
  return pokeFetch<PokemonSpecies>(
    `${POKEAPI_ENDPOINTS.pokemonSpecies}/${id}`,
  );
}

export async function getEvolutionChain(id: number): Promise<EvolutionChain> {
  return pokeFetch<EvolutionChain>(
    `${POKEAPI_ENDPOINTS.evolutionChain}/${id}`,
  );
}

export async function getType(name: string): Promise<TypeData> {
  return pokeFetch<TypeData>(`${POKEAPI_ENDPOINTS.type}/${name}`);
}

export async function getAbility(name: string): Promise<AbilityData> {
  return pokeFetch<AbilityData>(`${POKEAPI_ENDPOINTS.ability}/${name}`);
}

export async function getMove(name: string): Promise<MoveData> {
  return pokeFetch<MoveData>(`${POKEAPI_ENDPOINTS.move}/${name}`);
}

export async function getMachine(id: number): Promise<Machine> {
  return pokeFetch<Machine>(`${POKEAPI_ENDPOINTS.machine}/${id}`);
}

export async function getAllVersionGroups(): Promise<VersionGroup[]> {
  const list = await pokeFetch<ResourceList>(
    `${POKEAPI_ENDPOINTS.versionGroup}?limit=100`,
  );
  return Promise.all(
    list.results.map((entry) =>
      pokeFetch<VersionGroup>(
        `${POKEAPI_ENDPOINTS.versionGroup}/${entry.name}`,
      ),
    ),
  );
}

export async function fetchMovesByName(
  names: string[],
): Promise<Map<string, MoveData>> {
  return fetchInBatches(names, getMove);
}

export async function buildTmMapForVersionGroup(
  moves: MoveData[],
  versionGroupName: string,
): Promise<Map<string, number>> {
  const tmMap = new Map<string, number>();
  const machineCache = new Map<number, number | null>();

  for (const move of moves) {
    const machineEntry = move.machines?.find(
      (entry) => entry.version_group.name === versionGroupName,
    );
    if (!machineEntry) continue;

    const machineId = extractIdFromUrl(machineEntry.machine.url);
    if (!machineCache.has(machineId)) {
      const machine = await getMachine(machineId);
      machineCache.set(
        machineId,
        parseTmNumberFromItem(machine.item.name),
      );
    }

    const tmNumber = machineCache.get(machineId);
    if (tmNumber !== null && tmNumber !== undefined) {
      tmMap.set(move.name, tmNumber);
    }
  }

  return tmMap;
}

export async function getAllPokemonNames(): Promise<NamedResource[]> {
  const first = await pokeFetch<ResourceList>(
    `${POKEAPI_ENDPOINTS.pokemon}?limit=1`,
  );
  const all = await pokeFetch<ResourceList>(
    `${POKEAPI_ENDPOINTS.pokemon}?limit=${first.count}`,
  );
  return all.results;
}

export async function fetchPokemonBatch(urls: string[]): Promise<Pokemon[]> {
  return Promise.all(
    urls.map(async (url) => {
      const id = extractIdFromUrl(url);
      return getPokemonByIdOrName(id);
    }),
  );
}

export async function fetchPokemonByType(
  typeName: string,
  offset: number,
  limit = PAGE_SIZE,
): Promise<{ pokemon: Pokemon[]; total: number }> {
  const typeData = await getType(typeName);
  const slice = typeData.pokemon.slice(offset, offset + limit);
  const pokemon = await Promise.all(
    slice.map((entry) =>
      getPokemonByIdOrName(extractIdFromUrl(entry.pokemon.url)),
    ),
  );
  return { pokemon, total: typeData.pokemon.length };
}

export { PAGE_SIZE };
