/**
 * Content hash of the files in public/data, injected by next.config.ts from
 * public/data/manifest.json (written by scripts/build-data.mjs). Versioned
 * URLs let the browser and the service worker cache the data cache-first.
 */
export const DATA_VERSION = process.env.NEXT_PUBLIC_DATA_VERSION || "dev";

export class DataFileError extends Error {
  constructor(
    public status: number,
    public file: string,
  ) {
    super(`Could not load ${file} (${status})`);
    this.name = "DataFileError";
  }
}

export function dataUrl(file: string): string {
  return `/data/${file}?v=${DATA_VERSION}`;
}

export async function fetchDataFile<T>(
  file: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(dataUrl(file), {
    signal,
    cache: DATA_VERSION === "dev" ? "no-cache" : "force-cache",
  });
  if (!response.ok) throw new DataFileError(response.status, file);
  return (await response.json()) as T;
}
