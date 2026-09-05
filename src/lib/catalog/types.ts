export type SlimCatalogAbility = {
  name: string;
  is_hidden: boolean;
  slot: number;
};

export type SlimCatalogSprites = {
  front_default: string | null;
  officialArtwork: string | null;
  home: string | null;
};

export type SlimCatalogStat = {
  name: string;
  base: number;
};

export type SlimCatalogPokemon = {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  abilities: SlimCatalogAbility[];
  sprites: SlimCatalogSprites;
  stats: SlimCatalogStat[];
  moves: string[];
};

export type SlimCatalogPayload = {
  version: 1;
  generatedAt: string;
  pokemon: SlimCatalogPokemon[];
};
