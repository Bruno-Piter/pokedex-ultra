"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { AbilityInfo } from "@/lib/data/catalog";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpeciesDetail } from "@/features/pokemon/api/pokemon.api";
import type { PokemonSummary } from "@/features/pokemon/hooks/use-pokemon-detail";
import { PanelSection } from "@/features/pokemon/components/detail/panel-section";
import { TypeDefenses } from "@/features/pokemon/components/detail/type-defenses";
import {
  getCatchChance,
  getFemaleRatio,
  getGenerationLabel,
  titleCase,
} from "@/features/pokemon/utils/format";

function GenderBar({ genderRate }: { genderRate: number }) {
  const female = getFemaleRatio(genderRate);
  if (female === null) {
    return <p className="text-sm font-semibold">Genderless</p>;
  }
  const male = 100 - female;
  return (
    <div className="space-y-1.5">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-sky-400"
          initial={{ width: 0 }}
          animate={{ width: `${male}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.div
          className="h-full bg-pink-400"
          initial={{ width: 0 }}
          animate={{ width: `${female}%` }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="flex justify-between text-xs font-semibold tabular-nums">
        <span className="text-sky-500 dark:text-sky-300">♂ {male.toFixed(1).replace(/\.0$/, "")}%</span>
        <span className="text-pink-500 dark:text-pink-300">♀ {female.toFixed(1).replace(/\.0$/, "")}%</span>
      </div>
    </div>
  );
}

function Meter({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold tabular-nums">{label}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-brand"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function InfoTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-muted/40 px-3.5 py-3 ring-1 ring-border/40 ring-inset">
      <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function ProfileGrid({ species }: { species: SpeciesDetail }) {
  const catchChance = getCatchChance(species.captureRate);
  const hatchSteps =
    species.hatchCounter != null ? (species.hatchCounter + 1) * 255 : null;

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <InfoTile label="Gender ratio">
        <GenderBar genderRate={species.genderRate} />
      </InfoTile>
      <InfoTile label="Catch rate">
        <Meter
          value={species.captureRate}
          max={255}
          label={`${species.captureRate} · ~${catchChance.toFixed(1)}% with a Poké Ball`}
        />
      </InfoTile>
      <InfoTile label="Base friendship">
        {species.baseHappiness != null ? (
          <Meter value={species.baseHappiness} max={255} label={String(species.baseHappiness)} />
        ) : (
          <p className="text-sm font-semibold">—</p>
        )}
      </InfoTile>
      <InfoTile label="Egg groups">
        <p className="text-sm font-semibold">
          {species.eggGroups.length
            ? species.eggGroups
                .map((group) => (group === "no-eggs" ? "Undiscovered" : titleCase(group)))
                .join(" · ")
            : "—"}
        </p>
        {hatchSteps ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            ~{hatchSteps.toLocaleString("en-US")} steps to hatch
          </p>
        ) : null}
      </InfoTile>
      <InfoTile label="Growth rate">
        <p className="text-sm font-semibold">
          {species.growthRate ? titleCase(species.growthRate) : "—"}
        </p>
      </InfoTile>
      <InfoTile label="Origin">
        <p className="text-sm font-semibold">{getGenerationLabel(species.generation)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {[species.habitat && titleCase(species.habitat), species.color && titleCase(species.color)]
            .filter(Boolean)
            .join(" · ") || "Unknown habitat"}
        </p>
      </InfoTile>
    </div>
  );
}

type OverviewPanelProps = {
  summary: PokemonSummary;
  species: UseQueryResult<SpeciesDetail>;
  abilities: ReadonlyMap<string, AbilityInfo> | undefined;
};

export function OverviewPanel({ summary, species, abilities }: OverviewPanelProps) {
  return (
    <div className="space-y-4">
      <PanelSection title="Pokédex entry">
        {species.data ? (
          <div className="relative rounded-2xl bg-muted/40 p-4 pl-11 ring-1 ring-border/40 ring-inset">
            <Quote className="absolute top-4 left-4 size-4 text-primary" />
            <p className="text-[15px] leading-relaxed text-pretty">
              {species.data.flavorText ?? "No Pokédex entry available."}
            </p>
          </div>
        ) : species.isError ? (
          <ErrorState
            compact
            title="Couldn't load the Pokédex entry"
            onRetry={() => void species.refetch()}
            retrying={species.isFetching}
          />
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </PanelSection>

      <PanelSection title="Abilities">
        <ul className="grid gap-2.5">
          {summary.abilities.map((ability, index) => {
            const info = abilities?.get(ability.name);
            return (
              <motion.li
                key={ability.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
                className="rounded-2xl bg-muted/40 px-4 py-3 ring-1 ring-border/40 ring-inset"
              >
                <p className="flex items-center gap-2 font-semibold">
                  {info?.name ?? titleCase(ability.name)}
                  {ability.hidden ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                      Hidden
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {info?.effect ?? (abilities ? "No description available." : "Loading…")}
                </p>
              </motion.li>
            );
          })}
        </ul>
      </PanelSection>

      <PanelSection title="Profile">
        {species.data ? (
          <ProfileGrid species={species.data} />
        ) : species.isError ? (
          <ErrorState
            compact
            title="Couldn't load profile data"
            onRetry={() => void species.refetch()}
            retrying={species.isFetching}
          />
        ) : (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        )}
      </PanelSection>

      <PanelSection title="Type defenses" description={`How effective each type is against ${summary.displayName}.`}>
        <TypeDefenses types={summary.types} />
      </PanelSection>
    </div>
  );
}
