import { Skeleton } from "@/components/Skeleton";

export default function LogLoading() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Streak hero */}
      <Skeleton className="h-32 rounded-2xl" />

      {/* Goal bar */}
      <Skeleton className="h-14 rounded-2xl" />

      {/* Form */}
      <Skeleton className="h-12 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />

      {/* Today's logs */}
      <Skeleton className="h-4 w-32 rounded" />
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </main>
  );
}
