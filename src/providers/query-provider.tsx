"use client";

import {
  QueryClient,
  QueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";
import { useState, type ReactNode } from "react";
import { pokeKeys } from "@/lib/pokeapi/query-keys";

const CACHE_KEY = "pokedex-ultra-query-cache-v1";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 24 * 60 * 60 * 1000,
        gcTime: MAX_AGE,
        retry: 2,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

function createCatalogPersister() {
  return createAsyncStoragePersister({
    key: CACHE_KEY,
    storage: {
      getItem: async (key) => {
        const value = await get(key);
        return (value as string | undefined) ?? null;
      },
      setItem: async (key, value) => {
        await set(key, value);
      },
      removeItem: async (key) => {
        await del(key);
      },
    },
  });
}

const catalogQueryKey = pokeKeys.pokemon.catalog();

const browserPersister = isServer ? null : createCatalogPersister();

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  if (isServer || !browserPersister) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  const persister = browserPersister;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: MAX_AGE,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success" &&
            query.queryKey[0] === catalogQueryKey[0] &&
            query.queryKey.includes("catalog"),
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
