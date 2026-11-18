"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, ViewTransition, type CSSProperties } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useBackNavigation } from "@/hooks/use-back-navigation";
import { isNotFoundError } from "@/lib/pokeapi/errors";
import { movesIndexQuery } from "@/features/pokemon/api/queries";
import { usePokemonDetail } from "@/features/pokemon/hooks/use-pokemon-detail";
import { DetailHero } from "@/features/pokemon/components/detail/detail-hero";
import { DetailSkeleton } from "@/features/pokemon/components/detail/detail-skeleton";
import {
  DETAIL_PANEL_ID,
  DetailTabBar,
  useDetailTab,
  type DetailTab,
} from "@/features/pokemon/components/detail/detail-tabs";
import { DexNeighbors, useDexNavigation } from "@/features/pokemon/components/detail/dex-neighbors";
import { EvolutionPanel } from "@/features/pokemon/components/detail/evolution-panel";
import { MovesPanel } from "@/features/pokemon/components/detail/moves-panel";
import { OverviewPanel } from "@/features/pokemon/components/detail/overview-panel";
import { StatsPanel } from "@/features/pokemon/components/detail/stats-panel";
import { getPokemonTypeColors } from "@/features/pokemon/utils/format";

const DIRECTIONAL = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
};

function BackButton() {
  const goBack = useBackNavigation();
  return (
    <Button
      variant="ghost"
      onClick={goBack}
      className="group h-10 gap-1.5 rounded-xl px-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
      Back
    </Button>
  );
}

export function PokemonDetailView({ idParam }: { idParam: string }) {
  const { catalog, entry, pokemon, species, summary } = usePokemonDetail(idParam);
  const [tab, setTab] = useDetailTab();
  const { prev, next, go } = useDexNavigation(catalog.data, summary?.speciesId ?? 0, tab);
  const queryClient = useQueryClient();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Moves data is static and small: fetch it in the background.
  useEffect(() => {
    const timer = setTimeout(() => void queryClient.prefetchQuery(movesIndexQuery()), 1200);
    return () => clearTimeout(timer);
  }, [queryClient]);

  const displayName = summary?.displayName;
  useEffect(() => {
    if (displayName) document.title = `${displayName} · Pokédex Ultra`;
  }, [displayName]);

  const changeTab = (next: DetailTab) => {
    setTab(next);
    // Bring the new tab's content into view: when switching from deep inside
    // a long tab, or when the tab bar sits low on a phone screen (below the hero).
    const bar = tabsRef.current;
    if (!bar) return;
    const headerHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 0;
    const rect = bar.getBoundingClientRect();
    const top = rect.top + window.scrollY - headerHeight - 8;
    if (window.scrollY > top || rect.top > window.innerHeight * 0.45) {
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (!summary) {
    const notFound =
      isNotFoundError(pokemon.error) && (catalog.isError || (catalog.isSuccess && !entry));
    return (
      <>
        <Header />
        {notFound ? (
          <main className="mx-auto max-w-xl px-safe pt-10 pb-24">
            <EmptyState
              title="Pokémon not found"
              description={`There's no Pokémon called “${decodeURIComponent(idParam)}”.`}
              action={<BackButton />}
            />
          </main>
        ) : pokemon.isError && !catalog.isPending ? (
          <main className="mx-auto max-w-xl px-safe pt-10 pb-24">
            <ErrorState
              title="Couldn't load this Pokémon"
              onRetry={() => {
                void pokemon.refetch();
                if (catalog.isError) void catalog.refetch();
              }}
              retrying={pokemon.isFetching}
            />
          </main>
        ) : (
          <DetailSkeleton />
        )}
      </>
    );
  }

  const [t1, t2] = getPokemonTypeColors(summary.types);
  const base =
    summary.form && catalog.data ? catalog.data.bySpecies.get(summary.speciesId) : undefined;

  return (
    <>
      <Header />
      {/* Soft type-colored wash behind the page. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[70vh] opacity-40 transition-[background] duration-700"
        style={{
          background: `radial-gradient(60% 50% at 20% 0%, color-mix(in oklab, ${t1} 45%, transparent), transparent 70%), radial-gradient(50% 45% at 90% 10%, color-mix(in oklab, ${t2} 35%, transparent), transparent 70%)`,
        }}
      />
      <ViewTransition key={summary.id} enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
        <main
          className="mx-auto w-full max-w-7xl px-safe pt-3 pb-24 sm:px-6 sm:pt-5"
          style={{ "--t1": t1, "--t2": t2 } as CSSProperties}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <BackButton />
            <DexNeighbors prev={prev} next={next} tab={tab} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:items-start lg:gap-6">
            <div className="lg:sticky lg:top-[calc(var(--header-h,4rem)+1rem)]">
              <DetailHero
                summary={summary}
                genus={species.data?.genus ?? null}
                onSwipe={catalog.data ? go : undefined}
              />
            </div>

            <div className="min-w-0 space-y-4">
              <div
                ref={tabsRef}
                className="sticky top-[var(--header-h,3.5rem)] z-30 -mx-1 px-1 py-1.5 lg:static lg:mx-0 lg:p-0"
              >
                <DetailTabBar value={tab} onChange={changeTab} />
              </div>

              <div id={DETAIL_PANEL_ID} role="tabpanel" aria-labelledby={`detail-tab-${tab}`}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  {tab === "overview" ? (
                    <OverviewPanel
                      summary={summary}
                      species={species}
                      abilities={catalog.data?.abilities}
                    />
                  ) : null}
                  {tab === "stats" ? <StatsPanel summary={summary} /> : null}
                  {tab === "moves" ? (
                    <MovesPanel
                      pokemon={pokemon}
                      displayName={summary.displayName}
                      base={base ? { id: base.id, displayName: base.displayName } : undefined}
                    />
                  ) : null}
                  {tab === "evolution" ? (
                    <EvolutionPanel
                      currentId={summary.id}
                      displayName={summary.displayName}
                      catalog={catalog}
                      species={species}
                    />
                  ) : null}
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </ViewTransition>
    </>
  );
}
