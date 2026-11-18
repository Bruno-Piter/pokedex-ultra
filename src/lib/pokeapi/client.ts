import { PokeApiError } from "./errors";

const BASE_URL = "https://pokeapi.co/api/v2";
const REQUEST_TIMEOUT_MS = 15_000;

type FetchOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
};

/**
 * Combines the caller's signal (TanStack Query cancels on unmount) with a
 * timeout, so a stalled request on a flaky mobile connection fails and can be
 * retried instead of spinning forever.
 */
function withTimeout(signal: AbortSignal | undefined, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new DOMException("Request timed out", "TimeoutError")),
    timeoutMs,
  );
  const onAbort = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) controller.abort(signal.reason);
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    },
  };
}

export async function pokeFetch<T>(
  path: string,
  { signal, timeoutMs = REQUEST_TIMEOUT_MS }: FetchOptions = {},
): Promise<T> {
  const request = withTimeout(signal, timeoutMs);
  try {
    const response = await fetch(`${BASE_URL}${path}`, { signal: request.signal });
    if (!response.ok) {
      throw new PokeApiError(response.status, path);
    }
    return (await response.json()) as T;
  } finally {
    request.cleanup();
  }
}

export function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}
