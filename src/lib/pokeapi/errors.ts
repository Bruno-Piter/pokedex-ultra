export class PokeApiError extends Error {
  constructor(
    public status: number,
    public path: string,
  ) {
    super(`PokeAPI error ${status} at ${path}`);
    this.name = "PokeApiError";
  }
}
