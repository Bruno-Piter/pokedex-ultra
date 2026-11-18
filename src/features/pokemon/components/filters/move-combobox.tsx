"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, Search, X } from "lucide-react";
import { useMemo, useRef } from "react";
import type { DamageClass } from "@/lib/data/moves";
import { useMovesIndex } from "@/features/pokemon/hooks/use-catalog";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { MAX_MOVE_FILTERS } from "@/features/pokemon/utils/catalog-filters";
import { getTypeColor, titleCase } from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

type MoveItem = {
  value: string;
  label: string;
  type: string;
  damageClass: DamageClass | null;
};

type MoveComboboxProps = {
  /** Every move learnable by at least one Pokémon. */
  moveNames: string[];
  value: string[];
  onChange: (moves: string[]) => void;
};

/** Searchable multi-select for up to 4 moves (Pokémon must learn all of them). */
export function MoveCombobox({ moveNames, value, onChange }: MoveComboboxProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const movesIndex = useMovesIndex();
  const full = value.length >= MAX_MOVE_FILTERS;

  const items = useMemo<MoveItem[]>(() => {
    const index = movesIndex.data?.moves;
    return moveNames
      .map((name) => {
        const info = index?.get(name);
        return {
          value: name,
          label: info?.label ?? titleCase(name),
          type: info?.type ?? "normal",
          damageClass: info?.damageClass ?? null,
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [moveNames, movesIndex.data]);

  const itemByValue = useMemo(() => new Map(items.map((item) => [item.value, item])), [items]);
  const selected = useMemo(
    () =>
      value.map(
        (name) =>
          itemByValue.get(name) ?? {
            value: name,
            label: titleCase(name),
            type: "normal",
            damageClass: null,
          },
      ),
    [value, itemByValue],
  );

  return (
    <Combobox.Root
      items={items}
      multiple
      value={selected}
      onValueChange={(next) =>
        onChange((next as MoveItem[]).slice(0, MAX_MOVE_FILTERS).map((item) => item.value))
      }
      isItemEqualToValue={(a: MoveItem, b: MoveItem) => a.value === b.value}
      itemToStringLabel={(item: MoveItem) => item.label}
      limit={60}
    >
      <Combobox.Chips
        ref={anchorRef}
        className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-xl border border-border/70 bg-background/50 p-1.5 transition-[border-color,box-shadow] focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-primary/15"
      >
        <Combobox.Value>
          {(chips: MoveItem[]) => (
            <>
              {chips.map((item) => (
                <Combobox.Chip
                  key={item.value}
                  aria-label={item.label}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-secondary pr-1 pl-2 text-xs font-semibold text-secondary-foreground ring-1 ring-border/60 outline-none data-[highlighted]:ring-primary"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: getTypeColor(item.type) }}
                  />
                  {item.label}
                  <Combobox.ChipRemove
                    aria-label={`Remove ${item.label}`}
                    className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </Combobox.ChipRemove>
                </Combobox.Chip>
              ))}
              <div className="flex min-w-28 flex-1 items-center gap-1.5 pl-1.5">
                {chips.length === 0 ? (
                  <Search className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
                <Combobox.Input
                  disabled={full}
                  placeholder={
                    full ? "Up to 4 moves" : chips.length > 0 ? "Add another…" : "Search moves…"
                  }
                  className="h-7 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
                />
              </div>
            </>
          )}
        </Combobox.Value>
      </Combobox.Chips>

      <Combobox.Portal>
        <Combobox.Positioner anchor={anchorRef} sideOffset={6} className="z-[120] outline-none">
          <Combobox.Popup className="max-h-[min(18rem,var(--available-height))] w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto overscroll-contain rounded-xl border border-border/70 bg-popover p-1 text-popover-foreground shadow-2xl transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground empty:hidden">
              No moves found
            </Combobox.Empty>
            <Combobox.List>
              {(item: MoveItem) => {
                const isSelected = value.includes(item.value);
                return (
                  <Combobox.Item
                    key={item.value}
                    value={item}
                    disabled={full && !isSelected}
                    className={cn(
                      "flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none select-none",
                      "data-[highlighted]:bg-muted data-[disabled]:opacity-40",
                    )}
                  >
                    <span className="flex size-4 items-center justify-center text-primary">
                      <Combobox.ItemIndicator>
                        <Check className="size-4" strokeWidth={3} />
                      </Combobox.ItemIndicator>
                    </span>
                    <span className={cn("flex-1 truncate", isSelected && "font-semibold")}>
                      {item.label}
                    </span>
                    <TypeBadge type={item.type} size="sm" />
                  </Combobox.Item>
                );
              }}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
