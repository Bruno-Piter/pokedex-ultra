export const POKEAPI_ENDPOINTS = {
  pokemon: "/pokemon",
  pokemonSpecies: "/pokemon-species",
  type: "/type",
  ability: "/ability",
  move: "/move",
  evolutionChain: "/evolution-chain",
  berry: "/berry",
  item: "/item",
  location: "/location",
  moveLearnMethod: "/move-learn-method",
  generation: "/generation",
  game: "/version",
  versionGroup: "/version-group",
  machine: "/machine",
  nature: "/nature",
} as const;

export type PokeApiEndpoint =
  (typeof POKEAPI_ENDPOINTS)[keyof typeof POKEAPI_ENDPOINTS];
