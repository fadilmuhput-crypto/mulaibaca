import { Skeleton } from "@/components/Skeleton";

export default function CariLoading() {
  return (
    <main className="max-w-lg mx-auto">
      {/* Search bar */}
      <div className="sticky top-0 bg-surface z-10 px-4 py-3 border-b-1.5 border-ink/10">
        <Skeleton className="h-12 rounded-xl" />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Filter chips */}
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Results */}
        <Skeleton className="h-3 w-16 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card-elevated p-4 flex gap-3">
            <Skeleton className="w-14 h-20 rounded flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
