"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAbility } from "@/features/pokemon/hooks/use-pokemon-detail";
import type { AbilityData, PokemonAbility } from "@/features/pokemon/types";
import { getFlavorText } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

export function getAbilityShortEffect(
  ability: AbilityData | undefined,
): string | null {
  if (!ability) return null;

  return (
    ability.effect_entries.find((e) => e.language.name === "en")
      ?.short_effect ??
    getFlavorText(ability.flavor_text_entries ?? [], "en") ??
    null
  );
}

type AbilityTooltipProps = {
  entry: PokemonAbility;
  className?: string;
};

export function AbilityTooltip({ entry, className }: AbilityTooltipProps) {
  const [open, setOpen] = useState(false);
  const { data: ability, isLoading } = useAbility(entry.ability.name, open);
  const effect = getAbilityShortEffect(ability);
  const name = entry.ability.name.replace(/-/g, " ");

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        className={cn(
          "block truncate capitalize text-left underline-offset-2 hover:underline",
          className,
        )}
      >
        {name}
        {entry.is_hidden ? (
          <span className="text-muted-foreground"> (H)</span>
        ) : null}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs text-left leading-relaxed"
      >
        <p className="font-semibold capitalize">{name}</p>
        {entry.is_hidden ? (
          <p className="text-[10px] uppercase tracking-wide opacity-70">
            Hidden ability
          </p>
        ) : null}
        <p className="mt-1 opacity-90">
          {isLoading
            ? "Loading..."
            : (effect ?? "No description available.")}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
