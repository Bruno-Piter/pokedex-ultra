import { Skeleton } from "@/components/ui/skeleton";
import { ROW_GAP, ROW_GRID } from "@/features/pokemon/components/catalog/row-layout";
import { cn } from "@/lib/utils";

export function PokemonListSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="flex flex-col" style={{ gap: ROW_GAP }} aria-busy aria-label="Loading Pokémon">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-[76px] rounded-2xl border border-border/50 bg-card/50 px-3 md:h-[84px] md:px-4"
          style={{ opacity: 1 - index * 0.07 }}
        >
          <div className={cn(ROW_GRID, "h-full items-center gap-3")}>
            <Skeleton className="size-14 rounded-xl md:size-16" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-4 w-28 max-w-full" />
            </div>
            <div className="flex flex-col items-end gap-1 md:items-start">
              <Skeleton className="h-5 w-[4.5rem] rounded-full" />
            </div>
            <div className="hidden space-y-1.5 md:block">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            {Array.from({ length: 7 }).map((_, stat) => (
              <Skeleton key={stat} className="mx-auto hidden h-4 w-7 md:block" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
