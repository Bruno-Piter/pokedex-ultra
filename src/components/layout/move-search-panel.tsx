"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Swords, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_MOVE_FILTERS,
  getSelectedMoves,
  type MoveFilterSlots,
} from "@/components/layout/filter-utils";
import { usePokemonCatalog } from "@/features/pokemon/hooks/use-pokemon-catalog";
import { cn } from "@/lib/utils";

type MoveSearchPanelProps = {
  moves: MoveFilterSlots;
  onChange: (moves: MoveFilterSlots) => void;
};

const SLOT_LABELS = ["Ataque 1", "Ataque 2", "Ataque 3", "Ataque 4"] as const;

function formatMoveName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type MoveSlotSelectProps = {
  index: number;
  value: string | null;
  moves: MoveFilterSlots;
  allMoves: string[];
  onSelect: (move: string | null) => void;
};

function MoveSlotSelect({
  index,
  value,
  moves,
  allMoves,
  onSelect,
}: MoveSlotSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const takenElsewhere = useMemo(() => {
    const taken = new Set<string>();
    moves.forEach((move, i) => {
      if (move && i !== index) taken.add(move);
    });
    return taken;
  }, [moves, index]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? allMoves.filter((move) => {
          const label = formatMoveName(move).toLowerCase();
          return move.includes(q) || label.includes(q);
        })
      : allMoves;
    return list.slice(0, 80);
  }, [allMoves, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="glass-card relative flex flex-col gap-2 rounded-xl border border-border/40 p-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {SLOT_LABELS[index]}
        </p>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Limpar ${SLOT_LABELS[index]}`}
            onClick={() => {
              onSelect(null);
              setQuery("");
              setOpen(false);
            }}
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground/70" />
        <input
          type="text"
          value={open ? query : value ? formatMoveName(value) : ""}
          placeholder="Buscar ataque..."
          className={cn(
            "h-10 w-full rounded-lg border border-border/50 bg-background/60 pr-3 pl-8 text-sm outline-none transition-colors",
            "placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
            value && !open && "font-medium text-foreground",
          )}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(event) => {
            setOpen(true);
            setQuery(event.target.value);
          }}
          aria-expanded={open}
          aria-controls={`move-slot-list-${index}`}
          role="combobox"
        />
      </div>

      {open ? (
        <div
          id={`move-slot-list-${index}`}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-xl border border-border/60 bg-popover p-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              Nenhum ataque encontrado
            </p>
          ) : (
            filtered.map((move) => {
              const disabled = takenElsewhere.has(move);
              const selected = value === move;
              return (
                <button
                  key={move}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-center rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/15 font-medium text-primary"
                      : "hover:bg-muted",
                    disabled &&
                      "cursor-not-allowed opacity-40 hover:bg-transparent",
                  )}
                  onClick={() => {
                    if (disabled) return;
                    onSelect(move);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  {formatMoveName(move)}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}

export function MoveSearchPanel({ moves, onChange }: MoveSearchPanelProps) {
  const catalogQuery = usePokemonCatalog();
  const selectedCount = getSelectedMoves(moves).length;

  const allMoves = useMemo(() => {
    const names = new Set<string>();
    for (const pokemon of catalogQuery.data ?? []) {
      for (const entry of pokemon.moves) {
        names.add(entry.move.name);
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [catalogQuery.data]);

  const setSlot = (index: number, move: string | null) => {
    const next = [...moves] as MoveFilterSlots;
    next[index] = move;
    onChange(next);
  };

  const clearAll = () => onChange(EMPTY_MOVE_FILTERS);

  return (
    <section className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Swords className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Busca avançada por ataques</h2>
            <p className="text-[11px] text-muted-foreground">
              Pokémon que conhecem todos os ataques selecionados (AND)
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          onClick={clearAll}
          className={cn(
            "h-9 gap-1",
            selectedCount > 0 &&
              "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
        >
          <X className="size-3.5" />
          Limpar ataques
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SLOT_LABELS.map((_, index) => (
          <MoveSlotSelect
            key={SLOT_LABELS[index]}
            index={index}
            value={moves[index]}
            moves={moves}
            allMoves={allMoves}
            onSelect={(move) => setSlot(index, move)}
          />
        ))}
      </div>
    </section>
  );
}
