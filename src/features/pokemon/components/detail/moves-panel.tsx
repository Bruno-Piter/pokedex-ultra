"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  CircleDashed,
  Info,
  Search,
  Sword,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeSearchText } from "@/lib/data/catalog";
import type { DamageClass } from "@/lib/data/moves";
import type { PokemonDetail } from "@/features/pokemon/api/pokemon.api";
import { useMovesIndex } from "@/features/pokemon/hooks/use-catalog";
import { useLearnsetSource } from "@/features/pokemon/hooks/use-pokemon-detail";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import {
  collectLearnedMoves,
  formatLearnLevel,
  formatMoveValue,
  groupLearnedMoves,
  type LearnedMove,
  type MoveSection,
} from "@/features/pokemon/utils/move-groups";
import { getGameOptions, pickDefaultGame } from "@/features/pokemon/utils/version-group";
import { cn } from "@/lib/utils";

const DAMAGE_CLASS: Record<DamageClass, { label: string; color: string; Icon: LucideIcon }> = {
  physical: { label: "Physical", color: "#f97316", Icon: Sword },
  special: { label: "Special", color: "#60a5fa", Icon: WandSparkles },
  status: { label: "Status", color: "#a1a1aa", Icon: CircleDashed },
};

type CategoryFilter = "all" | DamageClass;

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "physical", label: "Physical" },
  { value: "special", label: "Special" },
  { value: "status", label: "Status" },
];

const ROW_GRID =
  "grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-3 md:grid-cols-[3.25rem_minmax(0,1.6fr)_5rem_6.25rem_2.75rem_2.75rem_2.25rem_1rem]";

function DamageClassTag({ damageClass, compact }: { damageClass: DamageClass; compact?: boolean }) {
  const { label, color, Icon } = DAMAGE_CLASS[damageClass];
  return (
    <span
      className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold"
      style={{ color, backgroundColor: `color-mix(in oklab, ${color} 16%, transparent)` }}
      title={label}
    >
      <Icon className="size-3" />
      {compact ? null : label}
    </span>
  );
}

function learnLabel(move: LearnedMove): string {
  if (move.method === "level-up") return formatLearnLevel(move.level);
  if (move.method === "machine") return move.machine ?? "TM";
  return "—";
}

function MoveRow({
  move,
  expanded,
  onToggle,
  animationDelay,
}: {
  move: LearnedMove;
  expanded: boolean;
  onToggle: () => void;
  animationDelay: number | null;
}) {
  const type = move.stats?.type ?? move.info?.type ?? "normal";
  const panelId = useId();

  return (
    <li
      className={cn("border-t border-border/40 first:border-t-0", animationDelay !== null && "animate-fade-up")}
      style={animationDelay !== null ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={cn(
          ROW_GRID,
          "w-full px-3 py-2.5 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:outline-none md:px-4",
          expanded && "bg-muted/40",
        )}
      >
        <span className="font-mono text-xs font-semibold text-muted-foreground tabular-nums">
          {learnLabel(move)}
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{move.label}</span>
          <span className="mt-1 flex items-center gap-1.5 md:hidden">
            <TypeBadge type={type} size="sm" />
            <DamageClassTag damageClass={move.damageClass} compact />
          </span>
        </span>

        <span className="hidden md:block">
          <TypeBadge type={type} size="sm" />
        </span>
        <span className="hidden md:block">
          <DamageClassTag damageClass={move.damageClass} />
        </span>

        {/* Phones: power on top, accuracy · PP below. */}
        <span className="text-right md:hidden">
          <span className="block font-mono text-sm font-bold tabular-nums">
            {formatMoveValue(move.stats?.power ?? null)}
          </span>
          <span className="block font-mono text-[10px] text-muted-foreground tabular-nums">
            {formatMoveValue(move.stats?.accuracy ?? null, "%")} · {formatMoveValue(move.stats?.pp ?? null)} PP
          </span>
        </span>

        <span className="hidden text-center font-mono text-sm font-semibold tabular-nums md:block">
          {formatMoveValue(move.stats?.power ?? null)}
        </span>
        <span className="hidden text-center font-mono text-sm tabular-nums md:block">
          {formatMoveValue(move.stats?.accuracy ?? null)}
        </span>
        <span className="hidden text-center font-mono text-sm tabular-nums md:block">
          {formatMoveValue(move.stats?.pp ?? null)}
        </span>
        <ChevronDown
          className={cn(
            "hidden size-4 text-muted-foreground transition-transform duration-300 md:block",
            expanded && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-3 mb-3 flex gap-2.5 rounded-2xl bg-muted/50 p-3 text-sm md:mx-4">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="space-y-1">
                <p className="text-pretty">{move.effect ?? "No description available."}</p>
                {move.info && move.info.priority !== 0 ? (
                  <p className="text-xs font-semibold text-primary">
                    Priority {move.info.priority > 0 ? `+${move.info.priority}` : move.info.priority}
                  </p>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function SectionBlock({
  section,
  expanded,
  onToggleMove,
  startIndex,
}: {
  section: MoveSection;
  expanded: string | null;
  onToggleMove: (key: string) => void;
  startIndex: number;
}) {
  const [open, setOpen] = useState(true);
  const lastColumn = section.id === "level-up" ? "Lv." : section.id === "machine" ? "TM" : "";

  return (
    <section className="overflow-hidden rounded-2xl ring-1 ring-border/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted/70"
      >
        <span>
          <span className="font-heading text-sm font-bold">{section.title}</span>
          <span className="ml-2 rounded-full bg-background/70 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground tabular-nums">
            {section.moves.length}
          </span>
          {section.description ? (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">{section.description}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform duration-300", !open && "-rotate-90")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                ROW_GRID,
                "hidden border-b border-border/40 px-4 py-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase md:grid",
              )}
            >
              <span>{lastColumn}</span>
              <span>Move</span>
              <span>Type</span>
              <span>Category</span>
              <span className="text-center">Pwr</span>
              <span className="text-center">Acc</span>
              <span className="text-center">PP</span>
              <span />
            </div>
            <ul>
              {section.moves.map((move, index) => (
                <MoveRow
                  key={move.key}
                  move={move}
                  expanded={expanded === move.key}
                  onToggle={() => onToggleMove(move.key)}
                  animationDelay={startIndex + index < 14 ? (startIndex + index) * 22 : null}
                />
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function MovesSkeleton() {
  return (
    <div className="space-y-3" aria-busy aria-label="Loading moves">
      <div className="flex gap-2">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-12 rounded-xl" style={{ opacity: 1 - index * 0.1 }} />
      ))}
    </div>
  );
}

type MovesPanelProps = {
  pokemon: UseQueryResult<PokemonDetail>;
  displayName: string;
  /** Default form, used when this form has no learnset of its own. */
  base: { id: number; displayName: string } | undefined;
};

export function MovesPanel({ pokemon, displayName, base }: MovesPanelProps) {
  const movesIndex = useMovesIndex();
  const learnset = useLearnsetSource(pokemon.data, base?.id);
  const [gameId, setGameId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const categoryPillId = useId();

  const games = useMemo(
    () =>
      learnset.moves && movesIndex.data ? getGameOptions(learnset.moves, movesIndex.data) : [],
    [learnset.moves, movesIndex.data],
  );
  const game = games.find((option) => option.id === gameId) ?? pickDefaultGame(games);

  const learned = useMemo(
    () =>
      learnset.moves && movesIndex.data && game
        ? collectLearnedMoves(learnset.moves, game, movesIndex.data)
        : [],
    [learnset.moves, movesIndex.data, game],
  );

  const sections = useMemo(() => {
    const search = normalizeSearchText(query);
    const filtered = learned.filter(
      (move) =>
        (category === "all" || move.damageClass === category) &&
        (!search ||
          normalizeSearchText(move.label).includes(search) ||
          (move.stats?.type ?? "").includes(search)),
    );
    return groupLearnedMoves(filtered);
  }, [learned, query, category]);

  const toggleMove = (key: string) => setExpanded((current) => (current === key ? null : key));

  if (pokemon.isError || (learnset.fromBase && learnset.baseQuery.isError)) {
    return (
      <ErrorState
        title="Couldn't load the moves"
        onRetry={() => {
          void pokemon.refetch();
          if (learnset.fromBase) void learnset.baseQuery.refetch();
        }}
        retrying={pokemon.isFetching || learnset.baseQuery.isFetching}
      />
    );
  }
  if (movesIndex.isError) {
    return (
      <ErrorState
        title="Couldn't load move data"
        onRetry={() => void movesIndex.refetch()}
        retrying={movesIndex.isFetching}
      />
    );
  }
  if (!learnset.moves || !movesIndex.data) {
    return <MovesSkeleton />;
  }
  if (!game) {
    return (
      <EmptyState
        title="No move data yet"
        description={`PokéAPI doesn't list any moves for ${displayName}.`}
      />
    );
  }

  // Index of each section's first row, for the staggered entrance.
  const sectionStarts = sections.map((_, sectionIndex) =>
    sections.slice(0, sectionIndex).reduce((sum, section) => sum + section.moves.length, 0),
  );

  return (
    <div className="space-y-4">
      <div className="glass-panel space-y-3 rounded-3xl p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={game.id}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setGameId(value);
                setExpanded(null);
              }
            }}
            items={games.map((option) => ({ value: option.id, label: option.label }))}
          >
            <SelectTrigger className="h-10 w-full rounded-xl bg-background/60 px-3 sm:w-64" aria-label="Game">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {games.map((option) => (
                <SelectItem key={option.id} value={option.id} className="py-2">
                  <span className="flex w-full items-center justify-between gap-3">
                    {option.label}
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {option.moveCount} moves
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <label className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search moves or types…"
              aria-label="Search moves"
              autoComplete="off"
              spellCheck={false}
              className="h-10 w-full rounded-xl border border-border/70 bg-background/60 pr-3 pl-9 text-sm outline-none transition-[border-color,box-shadow] focus:border-primary/60 focus:ring-4 focus:ring-primary/15"
            />
          </label>
        </div>

        <div role="radiogroup" aria-label="Category" className="grid grid-cols-4 gap-0.5 rounded-xl bg-muted/70 p-1">
          {CATEGORY_OPTIONS.map((option) => {
            const active = category === option.value;
            const style = option.value === "all" ? null : DAMAGE_CLASS[option.value];
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCategory(option.value)}
                className={cn(
                  "relative flex h-8 items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId={`move-category-${categoryPillId}`}
                    transition={{ type: "spring", stiffness: 500, damping: 36 }}
                    className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border/60"
                  />
                ) : null}
                {style ? <style.Icon className="relative size-3" style={{ color: style.color }} /> : null}
                <span className="relative">{option.label}</span>
              </button>
            );
          })}
        </div>

        {learnset.fromBase && base ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="size-3.5" />
            This form shares its moves with {base.displayName}.
          </p>
        ) : null}
      </div>

      {sections.length === 0 ? (
        <EmptyState
          title="No matching moves"
          description="Try another search, category or game."
        />
      ) : (
        <div key={`${game.id}:${category}`} className="space-y-3">
          {sections.map((section, sectionIndex) => (
            <SectionBlock
              key={section.id}
              section={section}
              expanded={expanded}
              onToggleMove={toggleMove}
              startIndex={sectionStarts[sectionIndex]}
            />
          ))}
          <p className="px-1 text-[11px] text-muted-foreground">
            Power, accuracy and PP as in {game.label}. Tap a move to see what it does.
          </p>
        </div>
      )}
    </div>
  );
}
