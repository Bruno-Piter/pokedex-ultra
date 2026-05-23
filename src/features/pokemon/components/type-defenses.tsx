"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { PokemonTypeName } from "@/features/pokemon/utils/format";
import { getTypeColor } from "@/features/pokemon/utils/format";
import { useTypeChart } from "@/features/pokemon/hooks/use-type-chart";
import {
  getTypeDefenses,
  TYPE_ABBREVIATIONS,
} from "@/features/pokemon/utils/type-effectiveness";
import { cn } from "@/lib/utils";

type TypeDefensesProps = {
  types: { type: { name: string } }[];
  pokemonName: string;
};

function multiplierTone(multiplier: number): string {
  if (multiplier > 1) {
    return "bg-emerald-600/90 text-yellow-300";
  }
  if (multiplier < 1 && multiplier > 0) {
    return "bg-red-900/90 text-yellow-300";
  }
  if (multiplier === 0) {
    return "bg-red-950 text-yellow-300";
  }
  return "bg-transparent text-transparent";
}

export function TypeDefenses({ types, pokemonName }: TypeDefensesProps) {
  const { data: chart, isLoading, isError } = useTypeChart();

  const defendingTypes = types.map(
    ({ type }) => type.name as PokemonTypeName,
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !chart) {
    return null;
  }

  const defenses = getTypeDefenses(defendingTypes, chart);

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-heading text-lg font-bold">Type defenses</h3>
        <p className="text-sm italic text-muted-foreground">
          The effectiveness of each type on{" "}
          <span className="capitalize">{pokemonName.replace(/-/g, " ")}</span>.
        </p>
      </div>

      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {defenses.map(({ type, multiplier, label }) => (
          <div key={type} className="flex flex-col gap-0.5">
            <div
              className="flex h-8 items-center justify-center rounded-sm text-[10px] font-bold tracking-wide text-white sm:h-9 sm:text-[11px]"
              style={{ backgroundColor: getTypeColor(type) }}
              title={type}
            >
              {TYPE_ABBREVIATIONS[type]}
            </div>
            <div
              className={cn(
                "flex h-8 items-center justify-center rounded-sm text-sm font-bold sm:h-9",
                multiplierTone(multiplier),
              )}
            >
              {label ?? ""}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
