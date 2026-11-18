import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

/** Content hash written by scripts/build-data.mjs (runs in prebuild/predev). */
function readDataVersion(): string {
  try {
    const manifest = JSON.parse(
      readFileSync(path.join(process.cwd(), "public", "data", "manifest.json"), "utf8"),
    ) as { version?: string };
    if (manifest.version) return manifest.version;
  } catch {
    // handled below
  }
  console.warn(
    "[pokedex] public/data/manifest.json not found — run `npm run data:build`.",
  );
  return "dev";
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DATA_VERSION: readDataVersion(),
  },
  experimental: {
    viewTransition: true,
  },
  images: {
    // Sprites never change: cache optimized images for 31 days.
    minimumCacheTTL: 2_678_400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
    ],
  },
};

export default withSerwist(nextConfig);
