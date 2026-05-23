"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type DexSearchProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function DexSearch({ value, onChange, className }: DexSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        id="dex-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nome ou número..."
        className="h-9 pl-9 pr-16"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="size-4" />
        </button>
      ) : null}
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-block">
        Ctrl+K
      </kbd>
    </div>
  );
}
