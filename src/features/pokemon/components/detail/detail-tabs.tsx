"use client";

import { motion } from "framer-motion";
import { BarChart3, BookOpen, GitBranch, Swords, type LucideIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useId, useRef } from "react";
import { cn } from "@/lib/utils";

export const DETAIL_TABS = [
  { id: "overview", label: "Overview", icon: BookOpen },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "moves", label: "Moves", icon: Swords },
  { id: "evolution", label: "Evolution", icon: GitBranch },
] as const satisfies readonly { id: string; label: string; icon: LucideIcon }[];

export type DetailTab = (typeof DETAIL_TABS)[number]["id"];

export const DETAIL_PANEL_ID = "detail-panel";

function parseTab(value: string | null): DetailTab {
  return DETAIL_TABS.some((tab) => tab.id === value) ? (value as DetailTab) : "overview";
}

/** Active tab, kept in `?tab=` so reloads, Back and prev/next keep it. */
export function useDetailTab(): [DetailTab, (tab: DetailTab) => void] {
  const searchParams = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));

  const setTab = useCallback((next: DetailTab) => {
    const params = new URLSearchParams(window.location.search);
    if (next === "overview") params.delete("tab");
    else params.set("tab", next);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, []);

  return [tab, setTab];
}

type DetailTabBarProps = {
  value: DetailTab;
  onChange: (tab: DetailTab) => void;
  /** Small count shown next to a tab label (e.g. number of moves). */
  badges?: Partial<Record<DetailTab, number | undefined>>;
};

export function DetailTabBar({ value, onChange, badges }: DetailTabBarProps) {
  const id = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = DETAIL_TABS.findIndex((tab) => tab.id === value);
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % DETAIL_TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + DETAIL_TABS.length) % DETAIL_TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = DETAIL_TABS.length - 1;
    else return;
    event.preventDefault();
    const next = DETAIL_TABS[nextIndex].id;
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Pokémon details"
      onKeyDown={onKeyDown}
      className="grid grid-cols-4 gap-1 rounded-2xl border border-border/60 bg-card/80 p-1 shadow-sm backdrop-blur-xl"
    >
      {DETAIL_TABS.map((tab) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        const badge = badges?.[tab.id];
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`detail-tab-${tab.id}`}
            aria-selected={active}
            aria-controls={DETAIL_PANEL_ID}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:gap-1.5 sm:text-sm",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`detail-tab-pill-${id}`}
                transition={{ type: "spring", stiffness: 480, damping: 36 }}
                className="absolute inset-0 rounded-xl bg-primary shadow-md shadow-primary/30"
              />
            ) : null}
            <Icon className="relative size-4" />
            <span className="relative">
              {tab.label}
              {badge !== undefined ? (
                <span className={cn("ml-1 hidden tabular-nums sm:inline", active ? "opacity-80" : "opacity-60")}>
                  {badge}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

