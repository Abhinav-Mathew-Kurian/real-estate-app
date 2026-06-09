import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters skeleton */}
        <aside className="lg:w-72 shrink-0">
          <Skeleton className="h-10 w-full rounded-2xl mb-3" />
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </aside>

        {/* Results skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-cream rounded-2xl overflow-hidden border border-border shadow-sm">
                <Skeleton className="h-52 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  <Skeleton className="h-7 w-36 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
