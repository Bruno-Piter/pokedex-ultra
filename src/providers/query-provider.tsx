"use client";

import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { isNotFoundError } from "@/lib/pokeapi/errors";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Pokédex data doesn't change while the app is open.
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000,
        // Try the network (or the service worker cache) even when the browser
        // reports offline, so cached responses still load.
        networkMode: "offlineFirst",
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => !isNotFoundError(error) && failureCount < 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
