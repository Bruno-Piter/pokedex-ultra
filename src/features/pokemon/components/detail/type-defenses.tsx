"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ShieldCheck, ShieldOff } from "lucide-react";
import type { ReactNode } from "react";
import {
  formatMultiplier,
  groupTypeDefenses,
  type TypeDefenseEntry,
} from "@/features/pokemon/utils/type-effectiveness";
import { getTypeColor, getTypeTextColor } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

function DefenseChip({ entry, index }: { entry: TypeDefenseEntry; index: number }) {
  const strong = entry.multiplier >= 4 || entry.multiplier === 0.25;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 420, damping: 24 }}
      className="inline-flex h-8 items-center overflow-hidden rounded-xl text-xs font-bold shadow-sm ring-1 ring-black/10"
    >
      <span
        className="flex h-full items-center px-2.5 uppercase"
        style={{
          backgroundColor: getTypeColor(entry.type),
          color: getTypeTextColor(entry.type),
        }}
      >
        {entry.type}
      </span>
      <span
        className={cn(
          "flex h-full items-center bg-background/80 px-2 tabular-nums",
          strong && "text-destructive",
        )}
      >
        {formatMultiplier(entry.multiplier)}
      </span>
    </motion.span>
  );
}

function DefenseGroup({
  icon,
  title,
  entries,
  empty,
  tone,
}: {
  icon: ReactNode;
  title: string;
  entries: TypeDefenseEntry[];
  empty: string;
  tone: string;
}) {
  return (
    <div className="space-y-2">
      <p className={cn("flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase", tone)}>
        {icon}
        {title}
        <span className="text-muted-foreground">({entries.length})</span>
      </p>
      {entries.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {entries.map((entry, index) => (
            <DefenseChip key={entry.type} entry={entry} index={index} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

export function TypeDefenses({ types }: { types: readonly string[] }) {
  const groups = groupTypeDefenses(types);

  return (
    <div className="space-y-4">
      <DefenseGroup
        icon={<ShieldAlert className="size-3.5" />}
        title="Weak to"
        entries={groups.weak}
        empty="No weaknesses."
        tone="text-destructive"
      />
      <DefenseGroup
        icon={<ShieldCheck className="size-3.5" />}
        title="Resists"
        entries={groups.resistant}
        empty="No resistances."
        tone="text-success"
      />
      {groups.immune.length > 0 ? (
        <DefenseGroup
          icon={<ShieldOff className="size-3.5" />}
          title="Immune to"
          entries={groups.immune}
          empty=""
          tone="text-primary"
        />
      ) : null}
      <p className="text-[11px] text-muted-foreground">
        Damage taken from each attacking type. Abilities (like Levitate) aren&apos;t included.
      </p>
    </div>
  );
}
