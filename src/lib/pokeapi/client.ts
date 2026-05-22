import { PokeApiError } from "./errors";

const BASE_URL = "https://pokeapi.co/api/v2";

type FetchOptions = {
  revalidate?: number;
};

export async function pokeFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    next: { revalidate: options.revalidate ?? 86400 },
  });

  if (!res.ok) {
    throw new PokeApiError(res.status, path);
  }

  return res.json() as Promise<T>;
}

export function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}
