import { Skeleton } from "@/components/ui/skeleton";

export default function ListingLoading() {
  return (
    <div className="min-h-screen bg-mist pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-3.5 w-10" />
          <Skeleton className="h-3.5 w-2" />
          <Skeleton className="h-3.5 w-14" />
          <Skeleton className="h-3.5 w-2" />
          <Skeleton className="h-3.5 w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-2xl" />
            <div className="bg-cream rounded-2xl border border-border p-6 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
            <div className="bg-cream rounded-2xl border border-border p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            </div>
            <Skeleton className="h-[360px] w-full rounded-2xl" />
          </div>

          {/* Right column */}
          <div>
            <div className="bg-cream rounded-2xl border border-border p-6 space-y-4">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-10 w-44" />
              <div className="border-t border-border pt-4 space-y-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
