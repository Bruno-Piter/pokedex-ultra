"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FilterSectionProps = {
  icon: ReactNode;
  title: string;
  hint?: string;
  activeCount?: number;
  children: ReactNode;
  className?: string;
};

export function FilterSection({
  icon,
  title,
  hint,
  activeCount = 0,
  children,
  className,
}: FilterSectionProps) {
  return (
    <section className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
            {icon}
          </span>
          <h3 className="text-[13px] font-semibold tracking-wide">{title}</h3>
        </div>
        <AnimatePresence>
          {activeCount > 0 ? (
            <motion.span
              key={activeCount}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 26 }}
              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
            >
              {activeCount}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      {hint ? <p className="-mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
      {children}
    </section>
  );
}
