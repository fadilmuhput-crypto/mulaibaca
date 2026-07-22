import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40 rounded" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Weekly goal */}
      <Skeleton className="h-16 rounded-2xl" />

      {/* Currently reading */}
      <Skeleton className="h-4 w-32 rounded" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-36 h-48 rounded-xl flex-shrink-0" />
        ))}
      </div>

      {/* Feed */}
      <Skeleton className="h-4 w-24 rounded" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </main>
  );
}
