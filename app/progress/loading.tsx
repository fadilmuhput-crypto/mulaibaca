import { Skeleton } from "@/components/Skeleton";

export default function ProgressLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Profile header */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Chart */}
      <Skeleton className="h-40 rounded-2xl" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
