"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useAbility } from "@/features/pokemon/hooks/use-pokemon-detail";
import type { PokemonAbility } from "@/features/pokemon/types";
import { getFlavorText } from "@/features/pokemon/utils/format";

type AbilityCardProps = {
  entry: PokemonAbility;
  index: number;
};

function AbilityCard({ entry, index }: AbilityCardProps) {
  const [open, setOpen] = useState(false);
  const { data: ability } = useAbility(entry.ability.name);

  const effect =
    ability?.effect_entries.find((e) => e.language.name === "pt")?.short_effect ??
    ability?.effect_entries.find((e) => e.language.name === "en")?.short_effect ??
    getFlavorText(ability?.flavor_text_entries ?? [], "pt");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-border/50 bg-card/50 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold capitalize">
            {entry.ability.name.replace(/-/g, " ")}
          </span>
          {entry.is_hidden && (
            <Badge variant="secondary" className="text-[10px]">
              Oculta
            </Badge>
          )}
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && effect && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border/30 px-4 pb-4 pt-2"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{effect}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

type AbilitiesListProps = {
  abilities: PokemonAbility[];
};

export function AbilitiesList({ abilities }: AbilitiesListProps) {
  return (
    <div className="space-y-3">
      {abilities.map((entry, i) => (
        <AbilityCard key={entry.ability.name} entry={entry} index={i} />
      ))}
    </div>
  );
}
