// ---------------------------------------------------------------------------
// PokéAPI resources fetched at runtime (detail page only). List data comes
// from the static catalog — see src/lib/data/catalog.ts.
// ---------------------------------------------------------------------------

export type NamedResource = {
  name: string;
  url: string;
};

export type LocalizedName = {
  name: string;
  language: NamedResource;
};

export type FlavorText = {
  flavor_text: string;
  language: NamedResource;
  version?: NamedResource;
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

export type Pokemon = {
  id: number;
  name: string;
  base_experience: number | null;
  height: number;
  weight: number;
  is_default?: boolean;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
  species: NamedResource;
};

export type PokemonSpecies = {
  id: number;
  name: string;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  hatch_counter: number | null;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  color: NamedResource;
  habitat: NamedResource | null;
  shape: NamedResource | null;
  generation: NamedResource;
  growth_rate: NamedResource | null;
  egg_groups: NamedResource[];
  evolution_chain: { url: string } | null;
  flavor_text_entries: FlavorText[];
  genera: { genus: string; language: NamedResource }[];
  names: LocalizedName[];
  varieties: { is_default: boolean; pokemon: NamedResource }[];
};

export type EvolutionDetail = {
  trigger: NamedResource;
  /** Game the condition applies to; `is_default` marks the current method. */
  version_group?: NamedResource | null;
  is_default?: boolean;
  item: NamedResource | null;
  held_item?: NamedResource | null;
  gender: number | null;
  known_move?: NamedResource | null;
  known_move_type?: NamedResource | null;
  location?: NamedResource | null;
  min_level: number | null;
  min_happiness?: number | null;
  min_beauty?: number | null;
  min_affection?: number | null;
  near_special_rock?: boolean;
  needs_multiplayer?: boolean;
  needs_overworld_rain?: boolean;
  party_species?: NamedResource | null;
  party_type?: NamedResource | null;
  relative_physical_stats?: number | null;
  time_of_day?: string;
  trade_species?: NamedResource | null;
  turn_upside_down?: boolean;
  region?: NamedResource | null;
  required_pokemon_form?: NamedResource | null;
  evolved_pokemon_form?: NamedResource | null;
  used_move?: NamedResource | null;
  min_move_count?: number | null;
  min_steps?: number | null;
  min_damage_taken?: number | null;
};

export type ChainLink = {
  is_baby: boolean;
  species: NamedResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
};

export type EvolutionChain = {
  id: number;
  chain: ChainLink;
};

// ---------------------------------------------------------------------------
// App types
// ---------------------------------------------------------------------------

export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export type StatFilterStat = StatName | "bst";

export type SortDirection = "asc" | "desc";

export type NatureModifier = "hindering" | "neutral" | "beneficial";

export type StatRange = {
  min: number;
  max: number;
};
