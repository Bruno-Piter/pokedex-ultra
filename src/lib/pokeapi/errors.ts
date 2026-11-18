export class PokeApiError extends Error {
  constructor(
    public status: number,
    public path: string,
  ) {
    super(`PokeAPI error ${status} at ${path}`);
    this.name = "PokeApiError";
  }
}

export function isNotFoundError(error: unknown): boolean {
  return (
    (error instanceof PokeApiError && error.status === 404) ||
    (typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: unknown }).status === 404)
  );
}

export function isOfflineError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  return error instanceof TypeError && /fetch|network/i.test(error.message);
}
