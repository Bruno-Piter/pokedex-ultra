"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

function WobblingPokeball() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden
      className="size-16 text-muted-foreground/40"
      animate={{ rotate: [0, -14, 12, -8, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
    >
      <path d="M6 50a44 44 0 0 1 88 0Z" className="fill-brand/30" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="7" />
      <path d="M6 50h88" stroke="currentColor" strokeWidth="7" />
      <circle cx="50" cy="50" r="13" className="fill-background" stroke="currentColor" strokeWidth="7" />
    </motion.svg>
  );
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <WobblingPokeball />
      <div className="space-y-1">
        <p className="font-heading text-lg font-semibold">{title}</p>
        {description ? (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </motion.div>
  );
}
