"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { DexSearch } from "@/components/layout/dex-search";
import { FILTER_SIDEBAR_WIDTH_CLASS } from "@/components/layout/layout-constants";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArtworkToggle } from "@/components/layout/artwork-toggle";
import { cn } from "@/lib/utils";

type HeaderProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
};

export function Header({ search, onSearchChange }: HeaderProps) {
  const hasCatalogSearch = Boolean(onSearchChange);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-4">
        <div
          className={cn(
            "flex shrink-0 items-center gap-3",
            hasCatalogSearch && FILTER_SIDEBAR_WIDTH_CLASS,
          )}
        >
          <motion.div
            whileHover={{ rotate: 12, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 260 }}
            className="relative size-10 overflow-hidden rounded-xl ring-1 ring-border/50"
          >
            <Image
              src="/icon.png"
              alt="Pokédex Ultra"
              fill
              sizes="40px"
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="min-w-0">
            <h1 className="font-heading truncate text-lg font-bold tracking-tight sm:text-xl">
              Pokédex Ultra
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Powered by PokéAPI
            </p>
          </div>
        </div>

        {hasCatalogSearch ? (
          <DexSearch
            value={search ?? ""}
            onChange={onSearchChange!}
            className="hidden min-w-0 flex-1 sm:block"
          />
        ) : (
          <div className="min-w-0 flex-1" />
        )}

        <div className="flex shrink-0 items-center gap-2">
          <ArtworkToggle />
          <ThemeToggle />
        </div>
      </div>

      {hasCatalogSearch ? (
        <div className="border-t border-border/40 px-4 pb-3 sm:hidden">
          <DexSearch value={search ?? ""} onChange={onSearchChange!} />
        </div>
      ) : null}
    </motion.header>
  );
}
