/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import {
  CacheableResponsePlugin,
  CacheFirst,
  ExpirationPlugin,
  Serwist,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

/**
 * App-specific caching, checked before Serwist's defaults:
 * - PokéAPI responses and sprites never change → cache-first, so Pokémon you
 *   have opened load instantly and work offline.
 * - /data/*.json URLs carry a content hash (?v=…) → safe to cache-first.
 * The default rules cap caches at 32–64 entries, far too small for a Pokédex.
 */
const pokedexCache: RuntimeCaching[] = [
  {
    matcher: ({ url }) => url.origin === "https://pokeapi.co" && url.pathname.startsWith("/api/"),
    handler: new CacheFirst({
      cacheName: "pokeapi",
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 800,
          maxAgeSeconds: 30 * DAY,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },
  {
    matcher: ({ url }) =>
      url.origin === "https://raw.githubusercontent.com" &&
      url.pathname.startsWith("/PokeAPI/sprites/"),
    handler: new CacheFirst({
      cacheName: "pokemon-sprites",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({
          maxEntries: 2500,
          maxAgeSeconds: 60 * DAY,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },
  {
    matcher: ({ url, sameOrigin }) => sameOrigin && url.pathname === "/_next/image",
    handler: new CacheFirst({
      cacheName: "next-image-sprites",
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 2000,
          maxAgeSeconds: 30 * DAY,
          purgeOnQuotaError: true,
        }),
      ],
    }),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin && url.pathname.startsWith("/data/") && url.searchParams.has("v"),
    handler: new CacheFirst({
      cacheName: "pokedex-data",
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        // Old versions are evicted as new deploys add new ?v= URLs.
        new ExpirationPlugin({ maxEntries: 6, purgeOnQuotaError: true }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...pokedexCache, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
