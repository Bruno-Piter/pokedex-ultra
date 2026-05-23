const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function headOk(url) {
  const res = await fetch(url, { method: "HEAD" });
  return res.ok;
}

async function mapPool(items, fn, concurrency = 25) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    results.push(...(await Promise.all(batch.map(fn))));
  }
  return results;
}

function pickPixelFromSprites(sprites) {
  const paths = [
    sprites?.versions?.["generation-ix"]?.["scarlet-violet"]?.front_default,
    sprites?.versions?.["generation-viii"]?.icons?.front_default,
    sprites?.versions?.["generation-vii"]?.icons?.front_default,
    sprites?.versions?.["generation-vi"]?.["x-y"]?.front_default,
    sprites?.versions?.["generation-v"]?.["black-white"]?.front_default,
    sprites?.front_default,
  ];
  return paths.find(Boolean) ?? null;
}

async function main() {
  const list = await fetchJson("https://pokeapi.co/api/v2/pokemon?limit=2000");
  console.log("Total pokemon entries:", list.count);

  const entries = list.results.map((r) => {
    const parts = r.url.replace(/\/$/, "").split("/");
    return { id: Number(parts[parts.length - 1]), name: r.name };
  });

  console.log("Checking CDN pixel sprites for all entries...");
  const cdnResults = await mapPool(entries, async (entry) => {
    const ok = await headOk(`${SPRITE_BASE}/${entry.id}.png`);
    return { ...entry, cdnOk: ok };
  });

  const cdnMissing = cdnResults.filter((r) => !r.cdnOk);
  console.log("CDN coverage:", cdnResults.length - cdnMissing.length, "/", cdnResults.length);
  console.log("CDN missing:", cdnMissing.length);
  if (cdnMissing.length) {
    console.log("First 25 CDN missing:");
    for (const m of cdnMissing.slice(0, 25)) {
      console.log(`  #${m.id} ${m.name}`);
    }
  }

  const sample = [
    ...entries.slice(0, 5),
    ...entries.filter((e) => e.id === 25 || e.id === 493 || e.id === 1025),
    ...entries.filter((e) => e.id >= 10000).slice(0, 10),
    ...entries.slice(-5),
  ];

  const uniqueSample = [...new Map(sample.map((s) => [s.id, s])).values()];
  console.log("\nAPI sprite field sample:");
  for (const entry of uniqueSample) {
    const data = await fetchJson(`https://pokeapi.co/api/v2/pokemon/${entry.id}`);
    const pixel = pickPixelFromSprites(data.sprites);
    const artwork = data.sprites.other?.["official-artwork"]?.front_default;
    console.log(
      `#${entry.id} ${entry.name}: pixel=${pixel ? "yes" : "no"} artwork=${artwork ? "yes" : "no"}`,
    );
  }
}

main().catch(console.error);
