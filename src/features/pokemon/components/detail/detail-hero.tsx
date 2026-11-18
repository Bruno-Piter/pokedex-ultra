"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState, ViewTransition } from "react";
import type { PokemonSummary } from "@/features/pokemon/hooks/use-pokemon-detail";
import { PokemonArtwork } from "@/features/pokemon/components/pokemon-artwork";
import { TypeBadge } from "@/features/pokemon/components/type-badge";
import { FORM_KIND_LABELS } from "@/features/pokemon/components/catalog/pokemon-row";
import {
  formatDexNumber,
  formatHeight,
  formatWeight,
} from "@/features/pokemon/utils/format";
import { cn } from "@/lib/utils";

const SPARKS = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2;
  const distance = 90 + (index % 3) * 26;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 8 + (index % 4) * 3,
    delay: (index % 4) * 0.03,
  };
});

/** Burst of stars played when switching to the shiny sprite. */
function SparkleBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {SPARKS.map((spark, index) => (
        <motion.svg
          key={index}
          viewBox="0 0 24 24"
          className="absolute text-amber-300 drop-shadow-[0_0_6px_rgb(252_211_77/0.9)]"
          style={{ width: spark.size, height: spark.size }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: spark.x, y: spark.y, scale: [0, 1.2, 0], opacity: [1, 1, 0], rotate: 90 }}
          transition={{ duration: 0.9, delay: spark.delay, ease: "easeOut" }}
        >
          <path
            fill="currentColor"
            d="M12 0l2.6 8.4L24 12l-9.4 3.6L12 24l-2.6-8.4L0 12l9.4-3.6z"
          />
        </motion.svg>
      ))}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-background/40 px-2 py-2 text-center ring-1 ring-border/50 ring-inset sm:px-3 sm:py-2.5 lg:text-left">
      <p className="truncate text-[9px] font-semibold tracking-wider text-muted-foreground uppercase sm:text-[10px]">
        {label}
      </p>
      <p className="mt-0.5 truncate font-heading text-sm font-bold tabular-nums sm:text-[15px]">
        {value}
      </p>
    </div>
  );
}

type DetailHeroProps = {
  summary: PokemonSummary;
  genus: string | null;
  /** Called with -1/+1 when the artwork is swiped. */
  onSwipe?: (direction: -1 | 1) => void;
  className?: string;
};

export function DetailHero({ summary, genus, onSwipe, className }: DetailHeroProps) {
  const [shiny, setShiny] = useState(false);
  const [burst, setBurst] = useState(0);
  const formLabel = summary.form ? FORM_KIND_LABELS[summary.form.kind] : null;

  const toggleShiny = () => {
    if (!shiny) setBurst((count) => count + 1);
    setShiny(!shiny);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!onSwipe) return;
    const swipe = info.offset.x + info.velocity.x * 0.2;
    if (swipe < -90) onSwipe(1);
    else if (swipe > 90) onSwipe(-1);
  };

  return (
    <section
      className={cn("type-hero relative overflow-hidden rounded-[2rem] p-5 sm:p-6", className)}
      aria-label={`${summary.displayName} overview`}
    >
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-background/50 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ring-1 ring-border/60">
            {formatDexNumber(summary.speciesId)}
          </span>
          {formLabel ? (
            <span className="rounded-full bg-background/50 px-2.5 py-1 text-[11px] font-semibold ring-1 ring-border/60">
              {formLabel}
            </span>
          ) : null}
          {summary.legendary || summary.mythical ? (
            <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-400/40 dark:text-amber-300">
              {summary.mythical ? "Mythical" : "Legendary"}
            </span>
          ) : null}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={toggleShiny}
          aria-pressed={shiny}
          aria-label={shiny ? "Show regular colors" : "Show shiny colors"}
          title={shiny ? "Regular" : "Shiny"}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ring-1 transition-colors",
            shiny
              ? "bg-amber-400 text-black ring-amber-300 shadow-[0_0_24px_-4px_rgb(251_191_36/0.8)]"
              : "bg-background/50 ring-border/60 hover:bg-background/80",
          )}
        >
          <motion.span
            animate={shiny ? { rotate: [0, 20, -10, 0], scale: [1, 1.3, 1] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="flex"
          >
            <Sparkles className="size-4" />
          </motion.span>
          Shiny
        </motion.button>
      </div>

      <div className="relative mx-auto my-1 aspect-square w-full max-w-[13rem] sm:my-2 sm:max-w-[17rem] lg:max-w-[19rem]">
        <div className="hero-aura absolute inset-[16%] rounded-full opacity-60" aria-hidden />
        <motion.div
          drag={onSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.35}
          onDragEnd={handleDragEnd}
          className="relative size-full cursor-grab touch-pan-y active:cursor-grabbing"
        >
          <div className="animate-float relative size-full">
            <ViewTransition name={`pokemon-art-${summary.id}`} share="morph" default="none">
              <div className="relative size-full">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={shiny ? "shiny" : "regular"}
                    initial={{ opacity: 0, scale: 0.88, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <PokemonArtwork
                      id={summary.id}
                      alt={shiny ? `Shiny ${summary.displayName}` : summary.displayName}
                      flags={summary.sprites}
                      shiny={shiny}
                      sizes="(min-width: 1024px) 304px, 70vw"
                      priority
                      className="drop-shadow-[0_18px_30px_rgb(0_0_0/0.45)]"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </ViewTransition>
          </div>
        </motion.div>
        <AnimatePresence>{burst > 0 && shiny ? <SparkleBurst key={burst} /> : null}</AnimatePresence>
      </div>

      <div className="relative z-10 text-center">
        <h1 className="font-heading text-3xl font-black tracking-tight text-balance sm:text-4xl">
          {summary.displayName}
        </h1>
        {genus ? <p className="mt-1 text-sm text-muted-foreground">{genus}</p> : null}
        <div className="mt-3 flex justify-center gap-2">
          {summary.types.map((type) => (
            <TypeBadge key={type} type={type} size="lg" />
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-4 gap-1.5 sm:mt-5 sm:gap-2 lg:grid-cols-2">
        <Fact label="Height" value={formatHeight(summary.height)} />
        <Fact label="Weight" value={formatWeight(summary.weight)} />
        <Fact label="BST" value={String(summary.bst)} />
        <Fact
          label="Base EXP"
          value={summary.baseExperience != null ? String(summary.baseExperience) : "—"}
        />
      </div>
    </section>
  );
}
