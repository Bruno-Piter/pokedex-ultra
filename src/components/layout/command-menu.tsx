"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { usePokemonSearchIndex } from "@/features/pokemon/hooks/use-pokemon-search";
import { formatPokemonId } from "@/features/pokemon/utils/format";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: index = [] } = usePokemonSearchIndex();

  const onSelect = useCallback(
    (name: string) => {
      setOpen(false);
      router.push(`/pokemon/${name}`);
    },
    [router],
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="hidden h-9 w-64 justify-start gap-2 text-muted-foreground sm:flex"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left text-sm">Buscar Pokémon...</span>
        <kbd className="pointer-events-none hidden rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:inline-block">
          Ctrl+K
        </kbd>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="size-9 sm:hidden"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
      >
        <Search className="size-4" />
      </Button>

      {open ? (
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Buscar por nome ou número..." />
          <CommandList>
            <CommandEmpty>Nenhum Pokémon encontrado.</CommandEmpty>
            <CommandGroup heading="Pokémon">
              {index.map((item) => {
                const id = item.url.split("/").filter(Boolean).pop();
                return (
                  <CommandItem
                    key={item.name}
                    value={`${item.name} ${id}`}
                    onSelect={() => onSelect(item.name)}
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatPokemonId(Number(id))}
                    </span>
                    <span className="capitalize">
                      {item.name.replace(/-/g, " ")}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      ) : null}
    </>
  );
}
