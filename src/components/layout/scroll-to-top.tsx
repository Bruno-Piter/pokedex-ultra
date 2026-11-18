"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useScrolledPast } from "@/hooks/use-window-scroll";

export function ScrollToTop({ threshold = 900 }: { threshold?: number }) {
  const visible = useScrolledPast(threshold);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-safe z-50 flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-popover/90 text-foreground shadow-xl backdrop-blur-md sm:right-6"
          aria-label="Back to top"
        >
          <ArrowUp className="size-5" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
