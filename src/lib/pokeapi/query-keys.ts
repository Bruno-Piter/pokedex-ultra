export const pokeKeys = {
  all: ["pokeapi"] as const,
  pokemon: {
    all: () => [...pokeKeys.all, "pokemon"] as const,
    lists: () => [...pokeKeys.pokemon.all(), "list"] as const,
    list: (filters: PokemonListFilters) =>
      [...pokeKeys.pokemon.lists(), filters] as const,
    details: () => [...pokeKeys.pokemon.all(), "detail"] as const,
    detail: (idOrName: string | number) =>
      [...pokeKeys.pokemon.details(), idOrName] as const,
    species: (id: number) =>
      [...pokeKeys.pokemon.all(), "species", id] as const,
    search: (query: string) =>
      [...pokeKeys.pokemon.all(), "search", query] as const,
  },
  type: {
    detail: (name: string) => [...pokeKeys.all, "type", name] as const,
  },
  evolution: {
    detail: (id: number) => [...pokeKeys.all, "evolution", id] as const,
  },
  ability: {
    detail: (name: string) => [...pokeKeys.all, "ability", name] as const,
  },
  move: {
    detail: (name: string) => [...pokeKeys.all, "move", name] as const,
  },
  versionGroup: {
    all: () => [...pokeKeys.all, "version-group"] as const,
    list: () => [...pokeKeys.versionGroup.all(), "list"] as const,
  },
  machine: {
    byVersionGroup: (name: string) =>
      [...pokeKeys.all, "machine", name] as const,
  },
};

export type PokemonListFilters = {
  type?: string;
  sort: "id" | "name" | "weight" | "height";
  search?: string;
};
