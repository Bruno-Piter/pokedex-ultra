import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { POKEMON_LIST_ROW_CLASS } from "@/features/pokemon/components/pokemon-list-row-layout";

export function PokemonCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 py-3 backdrop-blur-sm">
      <div className="px-3 sm:px-4">
        {/* Mobile compact */}
        <div className="flex items-center gap-3 md:hidden">
          <Skeleton className="size-14 shrink-0 rounded-lg sm:size-16" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-28 max-w-full" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Desktop table row */}
        <div className={`hidden md:grid ${POKEMON_LIST_ROW_CLASS}`}>
          <Skeleton className="size-[72px] rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full max-w-[120px]" />
            <Skeleton className="h-4 w-full max-w-[100px]" />
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="mx-auto h-4 w-6" />
          ))}
        </div>
      </div>
    </Card>
  );
}

export function PokemonGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 px-1">
      {Array.from({ length: count }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}