import type { MovesIndex } from "@/lib/data/moves";
import type { PokemonMove } from "@/features/pokemon/types";
import { titleCase } from "@/features/pokemon/utils/format";

const VERSION_GROUP_LABELS: Record<string, string> = {
  "red-green-japan": "Red / Green (JP)",
  "blue-japan": "Blue (JP)",
  "red-blue": "Red / Blue",
  yellow: "Yellow",
  "gold-silver": "Gold / Silver",
  crystal: "Crystal",
  "ruby-sapphire": "Ruby / Sapphire",
  emerald: "Emerald",
  colosseum: "Colosseum",
  xd: "XD: Gale of Darkness",
  "firered-leafgreen": "FireRed / LeafGreen",
  "diamond-pearl": "Diamond / Pearl",
  platinum: "Platinum",
  "heartgold-soulsilver": "HeartGold / SoulSilver",
  "black-white": "Black / White",
  "black-2-white-2": "Black 2 / White 2",
  "x-y": "X / Y",
  "omega-ruby-alpha-sapphire": "Omega Ruby / Alpha Sapphire",
  "sun-moon": "Sun / Moon",
  "ultra-sun-ultra-moon": "Ultra Sun / Ultra Moon",
  "lets-go-pikachu-lets-go-eevee": "Let's Go, Pikachu! / Eevee!",
  "sword-shield": "Sword / Shield",
  "the-isle-of-armor": "The Isle of Armor",
  "the-crown-tundra": "The Crown Tundra",
  "brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
  "brilliant-diamond-and-shining-pearl": "Brilliant Diamond / Shining Pearl",
  "legends-arceus": "Legends: Arceus",
  "scarlet-violet": "Scarlet / Violet",
  "the-teal-mask": "The Teal Mask",
  "the-indigo-disk": "The Indigo Disk",
  "legends-za": "Legends: Z-A",
  "mega-dimension": "Mega Dimension",
  champions: "Pokémon Champions",
};

/** DLC version groups are shown together with their base game. */
const VERSION_GROUP_FAMILY: Record<string, string> = {
  "the-isle-of-armor": "sword-shield",
  "the-crown-tundra": "sword-shield",
  "the-teal-mask": "scarlet-violet",
  "the-indigo-disk": "scarlet-violet",
  "mega-dimension": "legends-za",
};

export function getVersionGroupLabel(name: string): string {
  return VERSION_GROUP_LABELS[name] ?? titleCase(name);
}

export function getVersionGroupFamily(name: string): string {
  return VERSION_GROUP_FAMILY[name] ?? name;
}

export type GameOption = {
  /** Base version group of the family, e.g. "scarlet-violet". */
  id: string;
  label: string;
  order: number;
  generation: number;
  /** Version groups (base game + DLC) with learnset data for this Pokémon. */
  members: string[];
  hasLevelUp: boolean;
  moveCount: number;
};

/** Games in which a Pokémon has learnset data, newest first. */
export function getGameOptions(
  moves: readonly PokemonMove[],
  index: Pick<MovesIndex, "versionGroupByName">,
): GameOption[] {
  const families = new Map<
    string,
    { members: Set<string>; moveNames: Set<string>; hasLevelUp: boolean }
  >();

  for (const entry of moves) {
    for (const detail of entry.version_group_details) {
      const versionGroup = detail.version_group.name;
      const familyId = getVersionGroupFamily(versionGroup);
      const family = families.get(familyId) ?? {
        members: new Set<string>(),
        moveNames: new Set<string>(),
        hasLevelUp: false,
      };
      family.members.add(versionGroup);
      family.moveNames.add(entry.move.name);
      if (detail.move_learn_method.name === "level-up") family.hasLevelUp = true;
      families.set(familyId, family);
    }
  }

  return [...families.entries()]
    .map(([id, family]) => {
      const info = index.versionGroupByName.get(id);
      const memberOrders = [...family.members].map(
        (member) => index.versionGroupByName.get(member)?.order ?? 0,
      );
      return {
        id,
        label: getVersionGroupLabel(id),
        order: info?.order ?? Math.max(0, ...memberOrders),
        generation: info?.generation ?? 0,
        members: [...family.members],
        hasLevelUp: family.hasLevelUp,
        moveCount: family.moveNames.size,
      };
    })
    .sort((a, b) => b.order - a.order);
}

/**
 * Newest game with a regular level-up learnset. Skips games like Pokémon
 * Champions, whose "train" method replaces level-up learnsets.
 */
export function pickDefaultGame(options: readonly GameOption[]): GameOption | null {
  return options.find((option) => option.hasLevelUp) ?? options[0] ?? null;
}
