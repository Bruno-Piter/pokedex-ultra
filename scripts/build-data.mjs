/**
 * Builds the static data files the app reads at runtime:
 *
 *   public/data/catalog.json   every Pokémon (incl. forms) with stats, types,
 *                              abilities, official names and learnable moves
 *   public/data/moves.json     every move (type, category, power, accuracy,
 *                              PP, effect, TM/HM/TR per game, past values) and
 *                              the list of version groups (games)
 *   public/data/manifest.json  content hash used to version the URLs above
 *
 * PokéAPI is only hit at build time. Results are cached in
 * .next/cache/pokedex-data (kept between Vercel builds) and reused for
 * CACHE_MAX_AGE_DAYS, so most builds don't call PokéAPI at all.
 *
 * Flags:
 *   --force       ignore the cache and rebuild from PokéAPI
 *   --if-missing  do nothing when public/data is already complete (used by `predev`)
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE_URL = "https://pokeapi.co/api/v2";
const SCHEMA_VERSION = 2;
const CONCURRENCY = 24;
const MAX_RETRIES = 6;
const CACHE_MAX_AGE_DAYS = 7;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "data");
const CACHE_DIR = path.join(ROOT, ".next", "cache", "pokedex-data");
const DATA_FILES = ["catalog.json", "moves.json"];

const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

/** Sprite availability bitmask (decoded by src/lib/data/catalog.ts). */
const SPRITE_FLAGS = {
  artwork: 1,
  artworkShiny: 2,
  home: 4,
  homeShiny: 8,
  pixel: 16,
  pixelShiny: 32,
};

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const IF_MISSING = args.has("--if-missing");

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HttpError extends Error {
  constructor(status, url) {
    super(`${status} ${url}`);
    this.status = status;
  }
}

async function fetchJson(pathOrUrl) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        headers: { "User-Agent": "pokedex-ultra-data-builder" },
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      // Network error or timeout: retry with backoff.
      lastError = error;
      await sleep(500 * 2 ** attempt);
      continue;
    }
    if (response.status === 429 || response.status >= 500) {
      lastError = new HttpError(response.status, url);
      await sleep(500 * 2 ** attempt);
      continue;
    }
    if (!response.ok) throw new HttpError(response.status, url);
    return await response.json();
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed ${url}`);
}

/** Same as fetchJson, but resolves to null (with a warning) on 404. */
async function fetchOptional(pathOrUrl) {
  try {
    return await fetchJson(pathOrUrl);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      console.warn(`  ! skipped (404): ${pathOrUrl}`);
      return null;
    }
    throw error;
  }
}

async function mapPool(label, items, worker, concurrency = CONCURRENCY) {
  const results = new Array(items.length);
  const started = Date.now();
  let nextIndex = 0;
  let completed = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await worker(items[current], current);
      completed += 1;
      if (completed % 200 === 0 || completed === items.length) {
        const elapsed = ((Date.now() - started) / 1000).toFixed(1);
        console.log(`  ${label}: ${completed}/${items.length} (${elapsed}s)`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );
  return results;
}

function idFromUrl(url) {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

async function listAll(resource) {
  const list = await fetchJson(`/${resource}?limit=100000`);
  return list.results;
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

function englishName(entries) {
  return entries?.find((entry) => entry.language.name === "en")?.name ?? null;
}

function cleanText(text) {
  return text
    .replace(/[\f\n\r]+/g, " ")
    .replace(/­/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function classifyForm(pokemonName, form, displayName) {
  const formName = form?.form_name ?? "";
  if (form?.is_mega || /-mega(-[a-z0-9]+)?$/.test(pokemonName)) return "mega";
  if (formName === "gmax" || pokemonName.endsWith("-gmax")) return "gmax";
  if (formName.startsWith("primal") || pokemonName.endsWith("-primal")) {
    return "primal";
  }
  // Official names tell regional forms apart from look-alikes such as
  // "Alola Cap Pikachu" (form_name "alola-cap").
  if (/\b(Alolan|Galarian|Hisuian|Paldean)\b/.test(displayName)) return "regional";
  return "other";
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

async function buildCatalog() {
  const entries = await listAll("pokemon");
  console.log(`Catalog: ${entries.length} Pokémon`);

  const pokemon = (
    await mapPool("pokemon", entries, (entry) =>
      fetchOptional(`/pokemon/${idFromUrl(entry.url)}`),
    )
  ).filter(Boolean);

  const speciesIds = [...new Set(pokemon.map((p) => idFromUrl(p.species.url)))];
  const speciesList = await mapPool("species", speciesIds, (id) =>
    fetchOptional(`/pokemon-species/${id}`),
  );
  const speciesById = new Map(speciesList.filter(Boolean).map((s) => [s.id, s]));

  const nonDefault = pokemon.filter((p) => !p.is_default && p.forms?.[0]?.url);
  const forms = await mapPool("forms", nonDefault, (p) => fetchOptional(p.forms[0].url));
  const formByPokemon = new Map(nonDefault.map((p, index) => [p.name, forms[index]]));

  const moveNameSet = new Set();
  const abilityNameSet = new Set();
  for (const p of pokemon) {
    for (const entry of p.moves) moveNameSet.add(entry.move.name);
    for (const entry of p.abilities) abilityNameSet.add(entry.ability.name);
  }
  const moveNames = [...moveNameSet].sort();
  const moveIndex = new Map(moveNames.map((name, index) => [name, index]));

  const abilityNames = [...abilityNameSet].sort();
  const abilityList = await mapPool("abilities", abilityNames, (name) =>
    fetchOptional(`/ability/${name}`),
  );
  const abilities = {};
  abilityNames.forEach((slug, index) => {
    const ability = abilityList[index];
    const entry = { name: englishName(ability?.names) ?? titleCase(slug) };
    const effect = ability ? describe(ability) : null;
    if (effect) entry.effect = effect;
    abilities[slug] = entry;
  });

  const slim = pokemon
    .map((p) => {
      const speciesId = idFromUrl(p.species.url);
      const species = speciesById.get(speciesId);
      const speciesName = englishName(species?.names) ?? titleCase(p.species.name);
      const form = formByPokemon.get(p.name) ?? null;

      const displayName = p.is_default
        ? speciesName
        : (englishName(form?.names) ??
          `${speciesName} (${titleCase(form?.form_name || p.name.replace(`${p.species.name}-`, ""))})`);

      const statMap = Object.fromEntries(
        p.stats.map((entry) => [entry.stat.name, entry.base_stat]),
      );

      const sprites = p.sprites ?? {};
      const artwork = sprites.other?.["official-artwork"] ?? {};
      const home = sprites.other?.home ?? {};
      let spriteFlags = 0;
      if (artwork.front_default) spriteFlags |= SPRITE_FLAGS.artwork;
      if (artwork.front_shiny) spriteFlags |= SPRITE_FLAGS.artworkShiny;
      if (home.front_default) spriteFlags |= SPRITE_FLAGS.home;
      if (home.front_shiny) spriteFlags |= SPRITE_FLAGS.homeShiny;
      if (sprites.front_default) spriteFlags |= SPRITE_FLAGS.pixel;
      if (sprites.front_shiny) spriteFlags |= SPRITE_FLAGS.pixelShiny;

      const entry = {
        id: p.id,
        name: p.name,
        speciesId,
        displayName,
        isDefault: Boolean(p.is_default),
        generation: species ? idFromUrl(species.generation.url) : 0,
        types: [...p.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
        stats: STAT_ORDER.map((stat) => statMap[stat] ?? 0),
        abilities: [...p.abilities]
          .sort((a, b) => a.slot - b.slot)
          .map((a) => [a.ability.name, Boolean(a.is_hidden)]),
        height: p.height,
        weight: p.weight,
        baseExperience: p.base_experience ?? null,
        sprites: spriteFlags,
        moves: [...new Set(p.moves.map((m) => moveIndex.get(m.move.name)))].sort(
          (a, b) => a - b,
        ),
      };

      if (species?.is_legendary) entry.legendary = true;
      if (species?.is_mythical) entry.mythical = true;
      if (species?.is_baby) entry.baby = true;
      if (!p.is_default) {
        entry.form = {
          kind: classifyForm(p.name, form, displayName),
          battleOnly: Boolean(form?.is_battle_only),
        };
      }
      return entry;
    })
    .sort((a, b) => a.id - b.id);

  return {
    version: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    moveNames,
    abilities,
    pokemon: slim,
  };
}

// ---------------------------------------------------------------------------
// Moves + version groups
// ---------------------------------------------------------------------------

function machineLabel(itemName) {
  return /^(tm|hm|tr)\d+$/i.test(itemName) ? itemName.toUpperCase() : null;
}

/**
 * Short English description of a move or ability. Move effects keep the
 * `$effect_chance` placeholder so the client can fill in the value of the
 * selected game. Falls back to the latest English flavor text (newer entries
 * often lack effect_entries).
 */
function describe(resource) {
  const effect = resource.effect_entries?.find((entry) => entry.language.name === "en");
  if (effect?.short_effect) return cleanText(effect.short_effect);
  const flavor = resource.flavor_text_entries?.filter(
    (entry) => entry.language.name === "en",
  );
  const latest = flavor?.[flavor.length - 1]?.flavor_text;
  return latest ? cleanText(latest) : null;
}

async function buildMoves() {
  const versionGroupEntries = await listAll("version-group");
  const versionGroups = (
    await mapPool("version groups", versionGroupEntries, (entry) => fetchOptional(entry.url))
  )
    .filter(Boolean)
    .map((vg) => ({
      name: vg.name,
      order: vg.order,
      generation: idFromUrl(vg.generation.url),
    }))
    .sort((a, b) => a.order - b.order);

  const moveEntries = await listAll("move");
  console.log(`Moves: ${moveEntries.length}`);
  const rawMoves = (
    await mapPool("moves", moveEntries, (entry) => fetchOptional(entry.url))
  ).filter(Boolean);

  const machineIds = [
    ...new Set(rawMoves.flatMap((m) => (m.machines ?? []).map((x) => idFromUrl(x.machine.url)))),
  ];
  const machines = (
    await mapPool("machines", machineIds, (id) => fetchOptional(`/machine/${id}`))
  ).filter(Boolean);
  const machineLabelById = new Map(
    machines.map((machine) => [machine.id, machineLabel(machine.item.name)]),
  );

  const moves = {};
  for (const move of rawMoves.sort((a, b) => a.name.localeCompare(b.name))) {
    const entry = {
      id: move.id,
      label: englishName(move.names) ?? titleCase(move.name),
      type: move.type?.name ?? "normal",
      class: move.damage_class?.name ?? "status",
      power: move.power || null,
      accuracy: move.accuracy ?? null,
      pp: move.pp ?? null,
    };
    if (move.priority) entry.priority = move.priority;
    if (move.effect_chance != null) entry.effectChance = move.effect_chance;

    const effect = describe(move);
    if (effect) entry.effect = effect;

    const machineMap = {};
    for (const machine of move.machines ?? []) {
      const label = machineLabelById.get(idFromUrl(machine.machine.url));
      if (label) machineMap[machine.version_group.name] = label;
    }
    if (Object.keys(machineMap).length > 0) entry.machines = machineMap;

    const past = (move.past_values ?? [])
      .map((value) => {
        const record = { vg: value.version_group.name };
        if (value.power != null) record.power = value.power;
        if (value.accuracy != null) record.accuracy = value.accuracy;
        if (value.pp != null) record.pp = value.pp;
        if (value.effect_chance != null) record.effectChance = value.effect_chance;
        if (value.type) record.type = value.type.name;
        return record;
      })
      .filter((record) => Object.keys(record).length > 1);
    if (past.length > 0) entry.past = past;

    moves[move.name] = entry;
  }

  return {
    version: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    versionGroups,
    moves,
  };
}

// ---------------------------------------------------------------------------
// Cache + output
// ---------------------------------------------------------------------------

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function hasAll(dir) {
  return DATA_FILES.every((file) => existsSync(path.join(dir, file)));
}

async function readCacheMeta() {
  const meta = await readJson(path.join(CACHE_DIR, "meta.json"));
  if (!meta || meta.schema !== SCHEMA_VERSION || !hasAll(CACHE_DIR)) return null;
  const ageDays = (Date.now() - new Date(meta.generatedAt).getTime()) / 86_400_000;
  return ageDays <= CACHE_MAX_AGE_DAYS ? { ...meta, ageDays } : null;
}

async function writeOutputs(files, generatedAt) {
  await mkdir(OUT_DIR, { recursive: true });
  const hash = createHash("sha1");
  for (const [name, contents] of Object.entries(files)) {
    await writeFile(path.join(OUT_DIR, name), contents);
    hash.update(contents);
    const kb = (Buffer.byteLength(contents) / 1024).toFixed(0);
    console.log(`  wrote public/data/${name} (${kb} KB)`);
  }
  const manifest = {
    schema: SCHEMA_VERSION,
    version: hash.digest("hex").slice(0, 12),
    generatedAt,
  };
  await writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`  data version ${manifest.version}`);
}

async function main() {
  if (IF_MISSING && !FORCE) {
    const manifest = await readJson(path.join(OUT_DIR, "manifest.json"));
    if (manifest?.schema === SCHEMA_VERSION && hasAll(OUT_DIR)) {
      console.log("Pokédex data already present (public/data) — skipping.");
      return;
    }
  }

  if (!FORCE) {
    const meta = await readCacheMeta();
    if (meta) {
      console.log(
        `Using cached Pokédex data from ${meta.generatedAt} (${meta.ageDays.toFixed(1)} days old).`,
      );
      const files = {};
      for (const file of DATA_FILES) {
        files[file] = await readFile(path.join(CACHE_DIR, file), "utf8");
      }
      await writeOutputs(files, meta.generatedAt);
      return;
    }
  }

  console.log("Building Pokédex data from PokéAPI...");
  const started = Date.now();
  const catalog = await buildCatalog();
  const moves = await buildMoves();

  const files = {
    "catalog.json": JSON.stringify(catalog),
    "moves.json": JSON.stringify(moves),
  };

  await mkdir(CACHE_DIR, { recursive: true });
  for (const [name, contents] of Object.entries(files)) {
    await writeFile(path.join(CACHE_DIR, name), contents);
  }
  await writeFile(
    path.join(CACHE_DIR, "meta.json"),
    JSON.stringify({ schema: SCHEMA_VERSION, generatedAt: catalog.generatedAt }),
  );

  await writeOutputs(files, catalog.generatedAt);
  console.log(`Done in ${((Date.now() - started) / 1000).toFixed(0)}s.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
