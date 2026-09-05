import { extractIdFromUrl, pokeFetch } from "@/lib/pokeapi/client";
import { POKEAPI_ENDPOINTS } from "@/lib/pokeapi/endpoints";
import type { Pokemon, ResourceList } from "@/features/pokemon/types";
import type {
  SlimCatalogPayload,
  SlimCatalogPokemon,
} from "@/lib/catalog/types";

const BUILD_CONCURRENCY = 28;
const MAX_RETRIES = 4;

async function fetchWithRetry<T>(path: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      return await pokeFetch<T>(path, { revalidate: 86400 });
    } catch (error) {
      lastError = error;
      const delay = 400 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to fetch ${path}`);
}

async function mapInBatches<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => runWorker(),
  );
  await Promise.all(workers);
  return results;
}

export function slimPokemon(pokemon: Pokemon): SlimCatalogPokemon {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: [...pokemon.types]
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => entry.type.name),
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities.map((entry) => ({
      name: entry.ability.name,
      is_hidden: entry.is_hidden,
      slot: entry.slot,
    })),
    sprites: {
      front_default: pokemon.sprites.front_default,
      officialArtwork:
        pokemon.sprites.other?.["official-artwork"]?.front_default ?? null,
      home: pokemon.sprites.other?.home?.front_default ?? null,
    },
    stats: pokemon.stats.map((entry) => ({
      name: entry.stat.name,
      base: entry.base_stat,
    })),
    moves: pokemon.moves.map((entry) => entry.move.name),
  };
}

export async function buildSlimCatalog(): Promise<SlimCatalogPayload> {
  const first = await fetchWithRetry<ResourceList>(
    `${POKEAPI_ENDPOINTS.pokemon}?limit=1`,
  );
  const all = await fetchWithRetry<ResourceList>(
    `${POKEAPI_ENDPOINTS.pokemon}?limit=${first.count}`,
  );
  const ids = all.results.map((entry) => extractIdFromUrl(entry.url));

  const pokemon = await mapInBatches(ids, BUILD_CONCURRENCY, (id) =>
    fetchWithRetry<Pokemon>(`${POKEAPI_ENDPOINTS.pokemon}/${id}`),
  );

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    pokemon: pokemon.map(slimPokemon),
  };
}
