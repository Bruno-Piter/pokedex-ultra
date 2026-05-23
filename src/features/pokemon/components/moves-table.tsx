"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { usePokemonMoves } from "@/features/pokemon/hooks/use-pokemon-moves";
import type { EnrichedMove, MoveSection, PokemonMove } from "@/features/pokemon/types";
import {
  formatDamageClass,
  formatMoveStat,
  formatTmNumber,
} from "@/features/pokemon/utils/move-groups";
import { getTypeColor } from "@/features/pokemon/utils/format";

type MovesTableProps = {
  moves: PokemonMove[];
};

function MoveRow({ move, showLevel, showTm }: {
  move: EnrichedMove;
  showLevel: boolean;
  showTm: boolean;
}) {
  const typeColor = getTypeColor(move.type);

  return (
    <tr className="border-t border-border/30 hover:bg-muted/30">
      <td className="px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium capitalize">
            {move.name.replace(/-/g, " ")}
          </span>
          <TypeBadge type={move.type} className="text-[10px]" />
        </div>
      </td>
      <td className="px-4 py-2.5">
        <span
          className="inline-flex rounded-md border px-2 py-0.5 text-xs font-medium capitalize"
          style={{
            borderColor: `${typeColor}66`,
            color: typeColor,
            backgroundColor: `${typeColor}18`,
          }}
        >
          {formatDamageClass(move.damageClass)}
        </span>
      </td>
      <td className="px-4 py-2.5 font-mono text-muted-foreground">
        {formatMoveStat(move.power)}
      </td>
      <td className="px-4 py-2.5 font-mono text-muted-foreground">
        {formatMoveStat(move.accuracy)}
      </td>
      <td className="px-4 py-2.5 font-mono text-muted-foreground">
        {formatMoveStat(move.pp)}
      </td>
      <td className="px-4 py-2.5 font-mono">
        {showLevel
          ? move.level > 0
            ? move.level
            : "—"
          : showTm
            ? formatTmNumber(move.tmNumber)
            : "—"}
      </td>
    </tr>
  );
}

function MoveSectionTable({ section }: { section: MoveSection }) {
  const showLevel = section.id === "level-up";
  const showTm = section.id === "machine";
  const lastColumn = showLevel ? "Lvl" : showTm ? "TM" : "—";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <h3 className="text-sm font-semibold">
        {section.title}
        <span className="ml-2 font-normal text-muted-foreground">
          ({section.moves.length})
        </span>
      </h3>
      <div className="overflow-hidden rounded-xl border border-border/50">
        <table className="w-full text-sm">
          <thead className="bg-muted/80">
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Move</th>
              <th className="px-4 py-3 font-medium">Cat.</th>
              <th className="px-4 py-3 font-medium">Pwr</th>
              <th className="px-4 py-3 font-medium">Acc</th>
              <th className="px-4 py-3 font-medium">PP</th>
              <th className="px-4 py-3 font-medium">{lastColumn}</th>
            </tr>
          </thead>
          <tbody>
            {section.moves.map((move) => (
              <MoveRow
                key={move.name}
                move={move}
                showLevel={showLevel}
                showTm={showTm}
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

export function MovesTable({ moves }: MovesTableProps) {
  const { sections, versionGroupLabel, isLoading, isError } =
    usePokemonMoves(moves);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load moves.
      </p>
    );
  }

  if (sections.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No moves found for the latest version group.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {versionGroupLabel && (
        <p className="text-sm text-muted-foreground">
          Moves — <span className="font-medium text-foreground">{versionGroupLabel}</span>
        </p>
      )}
      {sections.map((section) => (
        <MoveSectionTable key={section.id} section={section} />
      ))}
    </div>
  );
}
