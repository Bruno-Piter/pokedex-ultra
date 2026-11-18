import type { EvolutionDetail } from "@/features/pokemon/types";
import { titleCase } from "@/features/pokemon/utils/format";

export type NameResolvers = {
  /** Move slug → official name ("dragon-cheer" → "Dragon Cheer"). */
  move?: (slug: string) => string;
  /** Pokémon/species slug → display name. */
  pokemon?: (slug: string) => string;
};

const ITEM_NAMES: Record<string, string> = {
  "kings-rock": "King's Rock",
  "dubious-disc": "Dubious Disc",
  "black-augurite": "Black Augurite",
  "peat-block": "Peat Block",
  "auspicious-armor": "Auspicious Armor",
  "malicious-armor": "Malicious Armor",
};

const TRIGGER_LABELS: Record<string, string> = {
  shed: "Level up with an empty party slot",
  spin: "Spin around holding a Sweet",
  "tower-of-darkness": "Train in the Tower of Darkness",
  "tower-of-waters": "Train in the Tower of Waters",
  "three-critical-hits": "Land 3 critical hits in one battle",
  "take-damage": "Lose HP, then pass under the stone arch",
  "recoil-damage": "Take recoil damage",
  "three-defeated-bisharp": "Defeat 3 Bisharp leaders",
  "gimmighoul-coins": "Collect 999 Gimmighoul Coins",
  other: "Special condition",
};

function itemName(slug: string): string {
  return ITEM_NAMES[slug] ?? titleCase(slug);
}

function timeOfDay(value: string): string {
  return value === "day" ? "Daytime" : titleCase(value);
}

/** One evolution method as a compact label, e.g. "Level up · High Friendship · Night". */
export function formatEvolutionDetail(
  detail: EvolutionDetail,
  names: NameResolvers = {},
): string {
  const move = (slug: string) => names.move?.(slug) ?? titleCase(slug);
  const pokemon = (slug: string) => names.pokemon?.(slug) ?? titleCase(slug);
  const trigger = detail.trigger?.name ?? "level-up";
  const parts: string[] = [];

  switch (trigger) {
    case "level-up":
      parts.push(detail.min_level ? `Lv. ${detail.min_level}` : "Level up");
      break;
    case "use-item":
      parts.push(detail.item ? `Use ${itemName(detail.item.name)}` : "Use an item");
      break;
    case "trade":
      parts.push(
        detail.trade_species ? `Trade for ${pokemon(detail.trade_species.name)}` : "Trade",
      );
      break;
    case "use-move": {
      const name = detail.used_move ? move(detail.used_move.name) : "a move";
      parts.push(
        detail.min_move_count ? `Use ${name} ${detail.min_move_count}×` : `Use ${name}`,
      );
      break;
    }
    case "agile-style-move":
    case "strong-style-move": {
      const style = trigger === "agile-style-move" ? "Agile" : "Strong";
      const slug = detail.used_move?.name ?? detail.known_move?.name;
      const count = detail.min_move_count ? ` ${detail.min_move_count}×` : "";
      parts.push(slug ? `Use ${move(slug)} in ${style} Style${count}` : `${style} Style move`);
      break;
    }
    case "recoil-damage":
    case "take-damage":
      parts.push(
        detail.min_damage_taken
          ? trigger === "recoil-damage"
            ? `Take ${detail.min_damage_taken}+ recoil damage`
            : `Lose ${detail.min_damage_taken}+ HP, then pass under the stone arch`
          : TRIGGER_LABELS[trigger],
      );
      break;
    default:
      parts.push(TRIGGER_LABELS[trigger] ?? titleCase(trigger));
  }

  if (trigger !== "level-up" && detail.min_level) parts.push(`Lv. ${detail.min_level}+`);
  if (detail.held_item) parts.push(`Holding ${itemName(detail.held_item.name)}`);
  if (detail.item && trigger !== "use-item") parts.push(`With ${itemName(detail.item.name)}`);
  if (detail.known_move && !trigger.endsWith("style-move")) {
    parts.push(`Knows ${move(detail.known_move.name)}`);
  }
  if (detail.known_move_type) {
    parts.push(`Knows a ${titleCase(detail.known_move_type.name)} move`);
  }
  if (detail.min_happiness) parts.push("High Friendship");
  if (detail.min_affection) parts.push("High Affection");
  if (detail.min_beauty) parts.push("High Beauty");
  if (detail.time_of_day) parts.push(timeOfDay(detail.time_of_day));
  if (detail.gender === 1) parts.push("Female");
  if (detail.gender === 2) parts.push("Male");
  if (detail.near_special_rock) parts.push("Near a special rock");
  else if (detail.location) parts.push(`At ${titleCase(detail.location.name)}`);
  if (detail.needs_overworld_rain) parts.push("While raining");
  if (detail.party_species) parts.push(`With ${pokemon(detail.party_species.name)} in party`);
  if (detail.party_type) parts.push(`With a ${titleCase(detail.party_type.name)}-type in party`);
  if (detail.relative_physical_stats === 1) parts.push("Attack > Defense");
  if (detail.relative_physical_stats === -1) parts.push("Attack < Defense");
  if (detail.relative_physical_stats === 0) parts.push("Attack = Defense");
  if (detail.turn_upside_down) parts.push("Hold the console upside down");
  if (detail.min_steps) parts.push(`Walk ${detail.min_steps.toLocaleString("en-US")} steps`);
  if (detail.needs_multiplayer) parts.push("In a Union Circle");
  if (detail.region) parts.push(`In ${titleCase(detail.region.name)}`);

  return parts.join(" · ");
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export type EvolutionConditions = {
  /** Current methods (PokéAPI `is_default`). */
  labels: string[];
  /** Methods from other games that differ from the current ones. */
  alternatives: string[];
};

export function formatEvolutionConditions(
  current: EvolutionDetail[],
  others: EvolutionDetail[] = [],
  names: NameResolvers = {},
): EvolutionConditions {
  const labels = unique(current.map((detail) => formatEvolutionDetail(detail, names)));
  const alternatives = unique(
    others.map((detail) => formatEvolutionDetail(detail, names)),
  ).filter((label) => !labels.includes(label));
  return { labels, alternatives };
}

/** Details describing the current method (falls back to all of them). */
export function getCurrentEvolutionDetails(details: EvolutionDetail[]): EvolutionDetail[] {
  const flagged = details.filter((detail) => detail.is_default);
  return flagged.length > 0 ? flagged : details;
}

export function getEvolutionLabel(details: EvolutionDetail[], names?: NameResolvers): string {
  const current = getCurrentEvolutionDetails(details);
  return current.length > 0 ? formatEvolutionDetail(current[0], names) : "";
}
