"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FilterSectionProps = {
  icon: ReactNode;
  title: string;
  hint?: string;
  activeCount?: number;
  index?: number;
  children: ReactNode;
  className?: string;
};

export function FilterSection({
  icon,
  title,
  hint,
  activeCount = 0,
  index = 0,
  children,
  className,
}: FilterSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className={cn("space-y-2", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
          <h3 className="text-xs font-semibold tracking-wide text-foreground">
            {title}
          </h3>
        </div>
        {activeCount > 0 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {activeCount} ativo{activeCount === 1 ? "" : "s"}
            </Badge>
          </motion.div>
        ) : null}
      </div>
      {hint ? (
        <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
      ) : null}
      <div className="rounded-xl border border-border/40 bg-muted/15 p-3">
        {children}
      </div>
    </motion.section>
  );
}
