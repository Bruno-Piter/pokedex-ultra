import { Skeleton } from "@/components/ui/skeleton";

/** Instant placeholder for /pokemon/[id] (route loading state and Suspense fallback). */
export function DetailSkeleton() {
  return (
    <main
      className="mx-auto w-full max-w-7xl px-safe pt-3 pb-24 sm:px-6 sm:pt-5"
      aria-busy
      aria-label="Loading Pokémon"
    >
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-11 rounded-2xl sm:w-36" />
          <Skeleton className="h-11 w-11 rounded-2xl sm:w-36" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[23rem_minmax(0,1fr)] lg:gap-6">
        <div className="rounded-[2rem] border border-border/60 bg-card/50 p-6">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-16 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <Skeleton className="mx-auto my-6 aspect-square w-full max-w-[15rem] rounded-full" />
          <Skeleton className="mx-auto h-9 w-48" />
          <Skeleton className="mx-auto mt-3 h-7 w-40 rounded-full" />
          <div className="mt-5 grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[3.25rem] rounded-2xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
