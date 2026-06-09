import { Skeleton } from "@/components/ui/skeleton";

export default function AdminListingsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-16 mt-1.5" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-20 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="bg-cream rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-mist/60 border-b border-border">
          <div className="flex gap-8">
            {["Title", "Type", "Location", "Price", "Status", "Added"].map((h) => (
              <Skeleton key={h} className="h-4 w-16" />
            ))}
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 px-4 py-3.5 border-b border-border last:border-0"
          >
            <Skeleton className="h-4 w-48 flex-shrink-0" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32 hidden md:block" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 hidden lg:block" />
            <div className="flex gap-1.5 ml-auto">
              <Skeleton className="h-7 w-8 rounded-lg" />
              <Skeleton className="h-7 w-16 rounded-lg" />
              <Skeleton className="h-7 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
