"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const CommandMenu = dynamic(
  () =>
    import("@/components/layout/command-menu").then((mod) => mod.CommandMenu),
  { ssr: false },
);

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 260 }}
            className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"
          >
            <Sparkles className="size-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight sm:text-xl">
              Pokédex Ultra
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Powered by PokéAPI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CommandMenu />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
