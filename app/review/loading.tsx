import { Skeleton } from "@/components/Skeleton";

export default function ReviewLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
      <Skeleton className="h-6 w-32 rounded" />

      {/* Waiting reviews */}
      <Skeleton className="h-4 w-40 rounded" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="card-elevated p-4 flex items-center gap-3">
          <Skeleton className="w-12 h-16 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}

      {/* Reviews */}
      <Skeleton className="h-4 w-24 rounded" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-elevated p-4 flex gap-3">
          <Skeleton className="w-16 h-22 rounded flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </main>
  );
}
