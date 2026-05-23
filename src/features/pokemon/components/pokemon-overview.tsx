"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Pokemon, PokemonSpecies } from "@/features/pokemon/types";
import {
  formatGenderRate,
  formatHeight,
  formatWeight,
  getFlavorText,
} from "@/features/pokemon/utils/format";

type PokemonOverviewProps = {
  pokemon: Pokemon;
  species: PokemonSpecies;
};

export function PokemonOverview({ pokemon, species }: PokemonOverviewProps) {
  const description = getFlavorText(species.flavor_text_entries);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground italic">
          &ldquo;{description}&rdquo;
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoItem label="Habitat" value={species.habitat?.name ?? "Unknown"} />
        <InfoItem label="Color" value={species.color.name} />
        <InfoItem label="Catch rate" value={String(species.capture_rate)} />
        <InfoItem label="Base happiness" value={String(species.base_happiness)} />
        <InfoItem label="Gender" value={formatGenderRate(species.gender_rate)} />
        <InfoItem
          label="Generation"
          value={species.generation.name.replace(/-/g, " ")}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {species.is_legendary && <Badge variant="secondary">Legendary</Badge>}
        {species.is_mythical && <Badge variant="secondary">Mythical</Badge>}
        <Badge variant="outline">Base EXP: {pokemon.base_experience}</Badge>
        <Badge variant="outline">Weight: {formatWeight(pokemon.weight)}</Badge>
        <Badge variant="outline">Height: {formatHeight(pokemon.height)}</Badge>
      </div>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize">{value.replace(/-/g, " ")}</p>
    </div>
  );
}
