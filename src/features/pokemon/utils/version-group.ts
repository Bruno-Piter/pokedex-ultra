import type { PokemonMove, VersionGroup } from "@/features/pokemon/types";

const VERSION_GROUP_LABELS: Record<string, string> = {
  "red-blue": "Red/Blue",
  yellow: "Yellow",
  "gold-silver": "Gold/Silver",
  crystal: "Crystal",
  "ruby-sapphire": "Ruby/Sapphire",
  emerald: "Emerald",
  "firered-leafgreen": "FireRed/LeafGreen",
  "diamond-pearl": "Diamond/Pearl",
  platinum: "Platinum",
  "heartgold-soulsilver": "HeartGold/SoulSilver",
  "black-white": "Black/White",
  "black-2-white-2": "Black 2/White 2",
  "x-y": "X/Y",
  "omega-ruby-alpha-sapphire": "Omega Ruby/Alpha Sapphire",
  "sun-moon": "Sun/Moon",
  "ultra-sun-ultra-moon": "Ultra Sun/Ultra Moon",
  "lets-go-pikachu-lets-go-eevee": "Let's Go Pikachu/Eevee",
  "sword-shield": "Sword/Shield",
  "brilliant-diamond-and-shining-pearl": "Brilliant Diamond/Shining Pearl",
  "legends-arceus": "Legends: Arceus",
  "scarlet-violet": "Scarlet/Violet",
  "the-teal-mask": "The Teal Mask",
  "the-indigo-disk": "The Indigo Disk",
};

export function getVersionGroupLabel(name: string): string {
  return VERSION_GROUP_LABELS[name] ?? name.replace(/-/g, " ");
}

export function collectVersionGroupNames(moves: PokemonMove[]): string[] {
  const names = new Set<string>();
  for (const entry of moves) {
    for (const detail of entry.version_group_details) {
      names.add(detail.version_group.name);
    }
  }
  return [...names];
}

export function resolveLatestVersionGroup(
  moves: PokemonMove[],
  versionGroups: VersionGroup[],
): VersionGroup | null {
  const pokemonGroups = new Set(collectVersionGroupNames(moves));
  if (pokemonGroups.size === 0) return null;

  const candidates = versionGroups.filter((vg) => pokemonGroups.has(vg.name));
  if (candidates.length === 0) return null;

  return candidates.reduce((latest, current) =>
    current.order > latest.order ? current : latest,
  );
}
