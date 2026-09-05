import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { buildSlimCatalog } from "@/lib/catalog/build-catalog";
import type { SlimCatalogPayload } from "@/lib/catalog/types";

export const revalidate = 86400;
export const maxDuration = 60;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

const PREBUILT_PATHS = [
  path.join(process.cwd(), "public", "data", "catalog.json"),
  path.join(process.cwd(), "data", "catalog.json"),
];

async function readPrebuiltCatalog(): Promise<SlimCatalogPayload | null> {
  for (const filePath of PREBUILT_PATHS) {
    try {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw) as SlimCatalogPayload;
    } catch {
      // try next candidate
    }
  }
  return null;
}

const getCachedCatalog = unstable_cache(
  async () => buildSlimCatalog(),
  ["slim-pokemon-catalog-v1"],
  { revalidate: 86400 },
);

export async function GET() {
  const prebuilt = await readPrebuiltCatalog();
  if (prebuilt) {
    return NextResponse.json(prebuilt, { headers: CACHE_HEADERS });
  }

  const catalog = await getCachedCatalog();
  return NextResponse.json(catalog, { headers: CACHE_HEADERS });
}
