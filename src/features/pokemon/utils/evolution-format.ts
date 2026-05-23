import type { EvolutionDetail } from "@/features/pokemon/types";

function formatDetail(detail: EvolutionDetail): string {
  const trigger = detail.trigger.name;

  if (detail.min_level != null && detail.min_level > 0) {
    return `Lv. ${detail.min_level}`;
  }

  if (detail.item) {
    return detail.item.name.replace(/-/g, " ");
  }

  if (detail.min_happiness != null && detail.min_happiness > 0) {
    return `Friendship ${detail.min_happiness}+`;
  }

  if (detail.known_move) {
    return `Know ${detail.known_move.name.replace(/-/g, " ")}`;
  }

  if (detail.time_of_day) {
    return detail.time_of_day.charAt(0).toUpperCase() + detail.time_of_day.slice(1);
  }

  if (detail.min_affection != null && detail.min_affection > 0) {
    return `Affection ${detail.min_affection}+`;
  }

  if (detail.gender === 1) return "Female";
  if (detail.gender === 2) return "Male";

  switch (trigger) {
    case "trade":
      return "Trade";
    case "use-item":
      return "Use item";
    case "level-up":
      return "Level up";
    case "other":
      return "Special";
    case "shed":
      return "Shed";
    case "spin":
      return "Spin";
    case "tower-of-darkness":
      return "Tower of Darkness";
    case "tower-of-waters":
      return "Tower of Waters";
    case "three-critical-hits":
      return "3 critical hits";
    case "take-damage":
      return "Take damage";
    case "agile-style-move":
      return "Agile style move";
    case "strong-style-move":
      return "Strong style move";
    case "recoil-damage":
      return "Recoil damage";
    default:
      return trigger.replace(/-/g, " ");
  }
}

export function getEvolutionLabel(details: EvolutionDetail[]): string {
  if (details.length === 0) return "";
  return formatDetail(details[0]);
}
