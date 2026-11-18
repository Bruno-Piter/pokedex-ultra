"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Grid3x3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useArtworkMode } from "@/providers/artwork-provider";

export function ArtworkToggle() {
  const { mode, toggle } = useArtworkMode();
  const mounted = useMounted();
  const isPixel = mounted && mode === "pixel";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-10 overflow-hidden rounded-xl sm:size-11"
      onClick={toggle}
      disabled={!mounted}
      aria-label={isPixel ? "Show official artwork" : "Show pixel sprites"}
      title={isPixel ? "Sprites: pixel art" : "Sprites: official artwork"}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isPixel ? "pixel" : "art"}
          initial={{ y: 14, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -14, opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="flex"
        >
          {isPixel ? <Grid3x3 className="size-[18px]" /> : <Sparkles className="size-[18px]" />}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
