import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PokemonCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/50 bg-card/60 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="mx-auto aspect-square w-full max-w-[140px] rounded-xl" />
        <Skeleton className="mx-auto h-5 w-24" />
        <div className="flex justify-center gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function PokemonGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}
