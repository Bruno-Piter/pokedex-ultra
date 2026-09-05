import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "https://pokeapi.co/api/v2";
const CONCURRENCY = 28;
const MAX_RETRIES = 5;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_FILE = path.join(ROOT, "public", "data", "catalog.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "pokedex-ultra-catalog-builder" },
      });
      if (response.status === 429 || response.status >= 500) {
        await sleep(500 * 2 ** attempt);
        continue;
      }
      if (!response.ok) {
        throw new Error(`${response.status} ${url}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed ${url}`);
}

async function mapInBatches(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current], current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () =>
      runWorker(),
    ),
  );
  return results;
}

function slimPokemon(pokemon) {
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

function extractIdFromUrl(url) {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

const first = await fetchJson(`${BASE_URL}/pokemon?limit=1`);
const all = await fetchJson(`${BASE_URL}/pokemon?limit=${first.count}`);
const ids = all.results.map((entry) => extractIdFromUrl(entry.url));

console.log(`Building slim catalog for ${ids.length} Pokemon...`);

const started = Date.now();
let completed = 0;

const pokemon = await mapInBatches(ids, CONCURRENCY, async (id) => {
  const data = await fetchJson(`${BASE_URL}/pokemon/${id}`);
  completed += 1;
  if (completed % 100 === 0 || completed === ids.length) {
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`  ${completed}/${ids.length} (${elapsed}s)`);
  }
  return slimPokemon(data);
});

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  pokemon,
};

await mkdir(path.dirname(OUT_FILE), { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(payload));

const mb = (Buffer.byteLength(JSON.stringify(payload)) / (1024 * 1024)).toFixed(
  2,
);
console.log(`Wrote ${OUT_FILE} (${mb} MB, ${pokemon.length} entries)`);
