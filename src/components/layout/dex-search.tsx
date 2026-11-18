"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type DexSearchProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const noopSubscribe = () => () => {};

function useIsMac() {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}

export function DexSearch({ value, onChange, className }: DexSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMac = useIsMac();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={cn("group relative w-full min-w-0", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <input
        ref={inputRef}
        id="dex-search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            if (value) onChange("");
            else event.currentTarget.blur();
          }
          if (event.key === "Enter") event.currentTarget.blur();
        }}
        placeholder="Search by name or number…"
        aria-label="Search Pokémon"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        enterKeyHint="search"
        className={cn(
          "h-11 w-full rounded-2xl border border-border/70 bg-card/70 pr-20 pl-10 text-[15px] shadow-sm outline-none transition-[border-color,box-shadow,background-color] sm:h-10 sm:text-sm",
          "placeholder:text-muted-foreground/70 hover:border-border focus:border-primary/60 focus:bg-card focus:ring-4 focus:ring-primary/15",
        )}
      />
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
        <AnimatePresence>
          {value ? (
            <motion.button
              type="button"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </motion.button>
          ) : null}
        </AnimatePresence>
        <kbd className="pointer-events-none hidden h-6 items-center rounded-md border border-border/80 bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </div>
    </div>
  );
}
