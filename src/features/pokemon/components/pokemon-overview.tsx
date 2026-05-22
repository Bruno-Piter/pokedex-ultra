"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Pokemon, PokemonSpecies } from "@/features/pokemon/types";
import {
  formatGenderRate,
  formatHeight,
  formatWeight,
  getFlavorText,
  getLocalizedName,
} from "@/features/pokemon/utils/format";

type PokemonOverviewProps = {
  pokemon: Pokemon;
  species: PokemonSpecies;
};

export function PokemonOverview({ pokemon, species }: PokemonOverviewProps) {
  const namePt = getLocalizedName(species.names);
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

      {namePt && namePt !== pokemon.name && (
        <p className="text-sm">
          <span className="text-muted-foreground">Nome em PT: </span>
          <span className="font-semibold">{namePt}</span>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoItem label="Habitat" value={species.habitat?.name ?? "Desconhecido"} />
        <InfoItem label="Cor" value={species.color.name} />
        <InfoItem label="Taxa de captura" value={String(species.capture_rate)} />
        <InfoItem label="Felicidade base" value={String(species.base_happiness)} />
        <InfoItem label="Gênero" value={formatGenderRate(species.gender_rate)} />
        <InfoItem label="Geração" value={species.generation.name.replace(/-/g, " ")} />
      </div>

      <div className="flex flex-wrap gap-2">
        {species.is_legendary && <Badge variant="secondary">Lendário</Badge>}
        {species.is_mythical && <Badge variant="secondary">Mítico</Badge>}
        <Badge variant="outline">EXP Base: {pokemon.base_experience}</Badge>
        <Badge variant="outline">Peso: {formatWeight(pokemon.weight)}</Badge>
        <Badge variant="outline">Altura: {formatHeight(pokemon.height)}</Badge>
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
