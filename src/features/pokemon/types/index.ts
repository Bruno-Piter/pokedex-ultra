export type NamedResource = {
  name: string;
  url: string;
};

export type ResourceList = {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
};

export type LocalizedName = {
  name: string;
  language: NamedResource;
};

export type FlavorText = {
  flavor_text: string;
  language: NamedResource;
  version: NamedResource;
};

export type EffectEntry = {
  effect: string;
  short_effect: string;
  language: NamedResource;
};

export type PokemonType = {
  slot: number;
  type: NamedResource;
};

export type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: NamedResource;
};

export type PokemonAbility = {
  is_hidden: boolean;
  slot: number;
  ability: NamedResource;
};

export type VersionDetail = {
  level_learned_at: number;
  move_learn_method: NamedResource;
  version_group: NamedResource;
};

export type PokemonMove = {
  move: NamedResource;
  version_group_details: VersionDetail[];
};

export type PokemonSpriteVersion = {
  front_default?: string | null;
};

export type PokemonSprites = {
  front_default: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    home?: {
      front_default: string | null;
    };
  };
  versions?: Record<string, Record<string, PokemonSpriteVersion>>;
};

export type Pokemon = {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  order: number;
  sprites: PokemonSprites;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  species: NamedResource;
  forms: NamedResource[];
};

export type PokemonSpecies = {
  id: number;
  name: string;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_legendary: boolean;
  is_mythical: boolean;
  color: NamedResource;
  habitat: NamedResource | null;
  shape: NamedResource;
  generation: NamedResource;
  evolution_chain: NamedResource;
  flavor_text_entries: FlavorText[];
  names: LocalizedName[];
  varieties: SpeciesVariety[];
};

export type SpeciesVariety = {
  is_default: boolean;
  pokemon: NamedResource;
};

export type PokemonFormData = {
  id: number;
  name: string;
  form_name: string;
  is_mega: boolean;
  is_battle_only: boolean;
  is_default: boolean;
  pokemon: NamedResource;
};

export type EvolutionDetail = {
  min_level: number | null;
  item: NamedResource | null;
  trigger: NamedResource;
  gender: number | null;
  min_happiness?: number | null;
  min_affection?: number | null;
  time_of_day?: string;
  known_move?: NamedResource | null;
};

export type PokemonSortOption =
  | "id"
  | "name"
  | "weight"
  | "height"
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed"
  | "bst";

export type SortDirection = "asc" | "desc";

export type StatFilterStat = StatName | "bst";

export type ChainLink = {
  is_baby: boolean;
  species: NamedResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
};

export type ExtendedChainLink = {
  species: NamedResource;
  speciesId: number;
  pokemonId: number;
  pokemonName: string;
  displayName: string;
  isFormBranch: boolean;
  connectorLabel: string | null;
  evolution_details: EvolutionDetail[];
  evolves_to: ExtendedChainLink[];
};

export type EvolutionChain = {
  id: number;
  chain: ChainLink;
};

export type TypePokemon = {
  pokemon: NamedResource;
  slot: number;
};

export type TypeDamageRelations = {
  double_damage_from: NamedResource[];
  half_damage_from: NamedResource[];
  no_damage_from: NamedResource[];
};

export type TypeData = {
  id: number;
  name: string;
  pokemon: TypePokemon[];
  damage_relations: TypeDamageRelations;
};

export type AbilityData = {
  id: number;
  name: string;
  effect_entries: EffectEntry[];
  flavor_text_entries: FlavorText[];
};

export type MoveData = {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number | null;
  priority: number;
  type: NamedResource;
  damage_class: NamedResource;
  effect_entries: EffectEntry[];
  flavor_text_entries: FlavorText[];
  machines: Array<{
    machine: NamedResource;
    version_group: NamedResource;
  }>;
};

export type VersionGroup = {
  id: number;
  name: string;
  order: number;
  generation: NamedResource;
  move_learn_methods: NamedResource[];
  pokedexes: NamedResource[];
  regions: NamedResource[];
  versions: NamedResource[];
};

export type Machine = {
  id: number;
  item: NamedResource;
  move: NamedResource;
  version_group: NamedResource;
};

export type LearnMethod =
  | "level-up"
  | "machine"
  | "egg"
  | "tutor"
  | "unknown";

export type NormalizedMove = {
  name: string;
  method: LearnMethod;
  level: number;
  versionGroup: string;
};

export type EnrichedMove = NormalizedMove & {
  type: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  tmNumber: number | null;
};

export type MoveSection = {
  id: LearnMethod;
  title: string;
  moves: EnrichedMove[];
};

export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export type NatureModifier = "hindering" | "neutral" | "beneficial";

export type StatRange = {
  min: number;
  max: number;
};
