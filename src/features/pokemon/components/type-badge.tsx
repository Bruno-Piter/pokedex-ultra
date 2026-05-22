"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getTypeColor } from "@/features/pokemon/utils/format";

type TypeBadgeProps = {
  type: string;
  className?: string;
};

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const color = getTypeColor(type);

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize text-white shadow-sm",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {type}
    </motion.span>
  );
}
